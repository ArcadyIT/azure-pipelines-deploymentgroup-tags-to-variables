# Deployment Group Tags to Variables

By default, you're not able to use Custom Conditions on Deployment Group Tags. This pipeline step adds the tags of the current deployment group target to your pipeline variables.

### When would you use this?

This task can be useful for you if you encountered the specific situation I encountered:

- You have a deployment group that contains lots of different machines with different tags describing individual differences.
- You have one generic pipeline that can release to any of the machines in the deployment group, but only one at a time using tag filters.
- You want to be able to execute more complex logic in custom scripts or using custom conditions against the current machine tags.

Previously, you would have to add a Deployment Group Job with the tag conditions, but if you wanted to add for example ten pipeline steps with the different tag conditions, you would have to add ten Deployment Group Jobs. Using this extension, you can start using target Tags in scripts, custom conditions and more. This will allow you to conditionally run a single step based on whether the current Deployment Target has a certain tag or not.

### What does it do?

It's really quite simple:

- The pipeline step is executed on the deployment group machine.
- It gets the attached tags of the machine, and saves them as `comma,separated,tags` in your Release Variables.
- You can now use the release variable in custom conditions, scripts or more!

# Contributing

This repository was created based on the ["Create a custom pipelines task"](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task) guide by Microsoft.

1. Clone the repository
1. Perform `npm install` in the `buildandreleasetask` directory
1. Make your changes
1. Run `tsc` in the `buildandreleasetask` directory
1. To package, first install the tfx-cli using `npm i -g tfx-cli`
1. Run `tfx extension create --manifest-globs vss-extension.json` to create the package
1. Upload the package to the extension gallery, or load it in your own Azure DevOps environment!

---

Proudly developed by [Wessel Loth](https://github.com/wsloth) with help from all the Arcadians at [Arcady](https://arcady.nl) during Hacktoberfest 2021.

[![arcady.nl logo](images/arcady-logo.png)](https://arcady.nl)
