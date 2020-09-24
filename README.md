# netlify-plugin-contextual-redirects

[![Netlify Status](https://api.netlify.com/api/v1/badges/7b59f403-9e40-4608-998f-54adb49f6f51/deploy-status)](https://app.netlify.com/sites/netlify-plugin-contextual-redirects/deploys) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fquarva%2Fnetlify-plugin-contextual-redirects.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fquarva%2Fnetlify-plugin-contextual-redirects?ref=badge_shield)

A Netlify build plugin to activate different redirects based on the deploy context.

## Usage

### Install

```bash
npm install --save @quarva/netlify-plugin-contextual-redirects

or 

yarn add @quarva/netlify-plugin-contextual-redirects
```

### Add the plugin to `netlify.toml`

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
```

Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

### Configuration

This plugin supports both standalone `_redirects` files and redirect blocks in `netlify.toml`. You can switch between these two using the `mode` input:

#### Modes

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
  [plugins.inputs]
  	"mode" = "append"
  		# Can be "append" or "standalone"
  	"config_file" = "./netlify.toml"
  		# Path to your netlify.toml
```

In `append` mode, you can optionally specify which `netlify.toml` file you'd like the redirects added to. If none is specified, the plugin defaults to `./netlify.toml`.

As the name suggests, redirects will be *appended* to the end of the file and existing redirects won't be overwritten, so you can combine permanent redirects - which live in the base `netlify.toml` - with context-specific rules.

In `standalone` mode, the plugin will always write to a `_redirects` file in your site's publish direrctory. 

**Default:** `standalone`

#### Redirect sources

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
  [plugins.inputs]
    "production" = "./redirects_production"
    "deploy_preview" = "./redirects_deploy_preview"
    "branch_deploy" = "./redirects_branch_deploy"
```

You can specify redirect source files for any of Netlify's three default deploy contexts. These files can live anywhere in your repository and can have any name you choose.

**Important:** make sure the source files you specify are formatted according to the mode you chose. Source files for `append` mode must use `[[redirects]]` blocks, and source files for `standalone` mode must use the Netlify `_redirects` syntax.

#### Other Options

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
  [plugins.inputs]
    "verbose" = ""
     # If true, the plugin will write each step to the deploy log.
```