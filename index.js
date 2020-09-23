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
		const redirect_file = getRedirects(env.CONTEXT);

		// If there are no redirects to set, bail out before the build starts
		if (!isValidString(redirect_file)) {
			return failPlugin('No redirects specified for context: ' + env.CONTEXT);
		}

		// If we're using a _redirects file, generate it
		if (redirect_mode == 'write') {
			Logger.debug('Write mode: using "' + redirect_file + '" in context "' + env.CONTEXT + '"');
			fs.copyFile(redirect_file, publish_dir + '/_redirects', (err) => {
			    if (err) {
			        return failBuild('Couldn\'t write _redirects: ' + err);
			    }
			    Logger.debug('Wrote _redirects successfully.');
			});
		}

		// If we're appending rules to netlify.toml, append 'em
		if (redirect_mode == 'append') {

			Logger.debug('Append mode: using "' + redirect_file + '" in context "' + env.CONTEXT + '" for ' + config_file);

			// Read the specified redirects file
			fs.readFile(redirect_file, function read(err, data) {
			    if (err) {
			        return failBuild('Couldn\'t read the specified redirects_file: ' + err);
			    }
			    const redirects = '\n\n' + data;

			   	Logger.debug('Preparing to append redirects...');
			    setRedirects(redirects);
			});

			// Append the redirects to the end of the specified config file
			function setRedirects(redirects) {
				try {
					Logger.debug('Appending redirects...');
					fs.appendFileSync(config_file,redirects);
					Logger.debug('Done.');
				} catch(err) {
					return failBuild('Error while appending redirects: ', err);
				}
			}
		}
    },
}