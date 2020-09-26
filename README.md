# Contextual Redirects for Netlify

[![Netlify Status](https://api.netlify.com/api/v1/badges/7b59f403-9e40-4608-998f-54adb49f6f51/deploy-status)](https://app.netlify.com/sites/netlify-plugin-contextual-redirects/deploys) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fquarva%2Fnetlify-plugin-contextual-redirects.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fquarva%2Fnetlify-plugin-contextual-redirects?ref=badge_shield)

A Netlify build plugin to activate different redirects based on the deploy context.

## Usage

### Install

```bash
npm install @quarva/netlify-plugin-contextual-redirects
```

or

```bash
yarn add @quarva/netlify-plugin-contextual-redirects
```

### Add the plugin to `netlify.toml`

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
```

Note: The `[[plugins]]` line is required for each plugin, even if you have other plugins in your `netlify.toml` file already.

### Configuration

#### Contexts

Before the plugin will do anything, you need to configure the deploy contexts in which it should activate. This is done by passing an array to the `contexts` input.

The array can include any of the standard Netlify deploy contexts - e.g. `production` or `deploy-preview` - or a branch name, if you've enabled branch deploys for your site.

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
	[plugins.inputs]
		"contexts" = ["production","staging"]
			# Here, production is a standard context and staging is a branch.
```

#### Modes

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
	[plugins.inputs]
		"contexts" = ["production","staging"]
		"mode" = "append"
			# Can be "append" or "standalone"
```

This plugin supports both standalone `_redirects` files and redirect blocks in `netlify.toml`. You can switch between these two using the `mode` input.

By default, the plugin operates in `standalone` mode - this will always write to a `_redirects` file in your site's publish direrctory. If that file already exists, it will be overwritten.

In `append` mode, redirects will be *appended* to the end of your `netlify.toml` file and existing redirects won't be overwritten. This allows you to combine permanent redirects - which live in the base `netlify.toml` - with context-specific rules.

#### Redirect Sources

When the plugin detects an active context, it looks for a `redirects_$context` file in your site's publish directory - for example, `/dist/redirects_production`.

**Important:** make sure the source files are formatted according to the mode you chose. Source files for `append` mode must use `[[redirects]]` blocks, and source files for `standalone` mode must use the Netlify `_redirects` syntax.

You can tell the plugin to look for source files in a different path using the `redirect_path` input.

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
	[plugins.inputs]
		"redirect_path" = "./config/redirects"
```

#### Other Options

```toml
[[plugins]]
package = "@quarva/netlify-plugin-contextual-redirects"
	[plugins.inputs]
		"verbose" = ""
		 # If true, the plugin will write each step to the deploy log.
```
---
Contextual Redirects for Netlify is a foundry project from [Quarva](https://quarva.com/).
