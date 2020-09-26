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
		const contexts = inputs.contexts;
		const redirect_mode = inputs.mode;
		const redirect_path = inputs.redirect_path || constants.PUBLISH_DIR

		// Prep the necessary variables
		const redirect_source = redirect_path + '/redirects_' + env.CONTEXT;
		const config_file = constants.CONFIG_PATH;
		const publish_dir = constants.PUBLISH_DIR;

		// Check to see if the current context is active
		const active = contexts.includes(env.CONTEXT)

		// If this isn't an active context, let the user know
		if (!active) {
			return console.log('Contextual redirects not enabled for context: ' + env.CONTEXT);
		}

		// If this is an active context, make sure the redirect file exists
		if ((active) && !fs.existsSync(redirect_source)) {
			return failBuild('Couldn\'t find the required redirects file: ' + redirect_source);
		}

		// If we're in standalone mode, copy the specified redirects to _redirects
		if ((active) && redirect_mode == 'standalone') {

			Logger.debug('Standalone mode: using "' + redirect_source + '" in context "' + env.CONTEXT + '"');

			async function setStandalone() {
				try {
					await fs.promises.copyFile(redirect_source, publish_dir + '/_redirects')
				} catch (err) {
					return failBuild('Couldn\'t write _redirects: ' + err);
				}

				Logger.debug('Wrote _redirects successfully.');	
			}

			setStandalone();
		}

		// If we're in append mode, read and append the specified redirects to the config file
		if ((active) && redirect_mode == 'append') {

			// Make sure the netlify.toml file exists
			if (!fs.existsSync(config_file)) {
				return failBuild('Couldn\'t find the config file: ' + config_file);
			}

			Logger.debug('Append mode: using "' + redirect_source + '" in context "' + env.CONTEXT + '" for ' + config_file);

			async function setAppend() {
				let data
				try {
					data = await fs.promises.readFile(redirect_source)
				} catch (err) {
					return failBuild('Couldn\'t read the specified redirects_file: ' + err);
				}

				const redirects = '\n\n' + data;
				
				Logger.debug('Appending redirects...');				
				try {
					await fs.promises.appendFile(config_file, redirects);
				} catch(err) {
					return failBuild('Error while appending redirects: ' + err);
				}
			}

			setAppend();
		}
	},
}