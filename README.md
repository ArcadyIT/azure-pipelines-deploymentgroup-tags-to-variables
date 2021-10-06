# Deployment Group Tags to Variables

By default, you're not able to use Custom Conditions on Deployment Group Tags. This pipeline step adds the tags of the current deployment group target to your pipeline variables.

Previously, you would have to add a Deployment Group Job with the tag conditions, but if you wanted to add for example ten pipeline steps with the different tag conditions, you would have to add ten Deployment Group Jobs.

Using this extension, you can start using target Tags in scripts, custom conditions and more. This will allow you to conditionally run a single step based on whether the current Deployment Target has a certain tag or not.

## Modifying this Repository

This repository was created based on the ["Create a custom pipelines task"](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task) guide by Microsoft.

1. Clone the repository
1. Perform `npm install` in the `buildandreleasetask` directory
1. Make your changes
1. Run `tsc` in the `buildandreleasetask` directory
1. To package, first install the tfx-cli using `npm i -g tfx-cli`
1. Run `tfx extension create --manifest-globs vss-extension.json` to create the package
1. Upload the package to the extension gallery, or load it in your own Azure DevOps environment!
