const env = require('./env');
const fs = require('fs');

const isValidString = (value)=> !!value&&value!=='';
const Logger = {
    info:console.log,
    debug:(message)=>{
        if(verbose){
            console.debug(message);
        }
    },
    error:console.error
};

module.exports = {

    onPreBuild: ({ constants, inputs, utils: { build: { failPlugin, failBuild } } }) => {

	    // Check inputs
	    global.verbose = inputs.verbose;

		function getRedirects(context){   
		    switch(context){   
		        case 'production': return inputs.production;
		        case 'deploy_preview': return inputs.deploy_preview;
		        case 'branch_deploy': return inputs.branch_deploy;
		        default: return "";      
		    }
		}

		// Prep the necessary variables
		const redirect_mode = inputs.mode;
		const config_file = inputs.config_file;
		const publish_dir = constants.PUBLISH_DIR;
		const redirect_source = getRedirects(env.CONTEXT);

		// If no redirects have been specified for this context, bail out before the build starts
		if (!isValidString(redirect_source)) {
			return failPlugin('No redirects specified for context: ' + env.CONTEXT);
		}

		// If redirects have been specified for this context, verify that the file exists
		if (!fs.existsSync(redirect_source)) {
			return failBuild('Couldn\'t find the specified redirects file: ' + redirect_source);
		}

		// If we're in standalone mode, copy the specified redirects to _redirects
		if (redirect_mode == 'standalone') {
			
			Logger.debug('Write mode: using "' + redirect_source + '" in context "' + env.CONTEXT + '"');

			try {
				fs.copyFile(redirect_source, publish_dir + '/_redirects', (err) => {
				    if (err) {
				        return failBuild('Couldn\'t write _redirects: ' + err);
				    }
				    Logger.debug('Wrote _redirects successfully.');	
				});
			} catch(err) {
				return failBuild('Error while writing _redirects: ' + err);
			}
		}

		// If we're in append mode, read and append the specified redirects to the config file
		if (redirect_mode == 'append') {

			Logger.debug('Append mode: using "' + redirect_source + '" in context "' + env.CONTEXT + '" for ' + config_file);

			// Read the redirects file...
			fs.readFile(redirect_source, function read(err, data) {
			    if (err) {
			        return failBuild('Couldn\'t read the specified redirects_file: ' + err);
			    }
			    const redirects = '\n\n' + data;

			   	Logger.debug('Preparing to append redirects...');
			    setRedirects(redirects);
			});

			// ...then append it.
			function setRedirects(redirects) {
				try {
					Logger.debug('Appending redirects...');
					fs.appendFileSync(config_file,redirects);
					Logger.debug('Done.');
				} catch(err) {
					return failBuild('Error while appending redirects: ' + err);
				}
			}
		}
    },
}