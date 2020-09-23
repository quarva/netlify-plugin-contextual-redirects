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

    onPreBuild: ({ inputs, utils: { build: { failPlugin, failBuild } } }) => {
	try {
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
		const redirect_file = getRedirects(env.CONTEXT);
		const config_file = inputs.config_file;

		// If there are no redirects to set, bail out before the build starts
		if (!isValidString(redirect_file)) {
			return failPlugin('No redirects specified for context: ' + env.CONTEXT);
		}

		Logger.debug('Using "' + redirect_file + '"" in context "' + env.CONTEXT + '"" with ' + config_file);

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

	} catch {
		console.log('Something has gone horribly wrong.');
	}
    },
}