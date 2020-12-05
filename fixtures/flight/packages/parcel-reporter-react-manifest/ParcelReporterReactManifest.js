// @flow
const {Reporter} = require('@parcel/plugin');
const path = require('path');
const {pathToFileURL} = require('url');

module.exports = new Reporter({
  async report({event, options}) {
    if (event.type !== 'buildSuccess') {
      return;
    }
    
    let {bundleGraph} = event;
    let json = {};
    for (let bundle of bundleGraph.getBundles()) {
      if (bundle.isInline) {
        continue;
      }

      bundle.traverse(node => {
        if (node.type !== 'dependency' || !node.value.isAsync) {
          return;
        }

        let referencedBundle = bundleGraph.getReferencedBundle(node.value, bundle);
        let loader = bundleGraph.getDependencyResolution(node.value, bundle);
        if (!referencedBundle || !loader) {
          return;
        }

        referencedBundle.traverseAssets(asset => {
          if (!/\.client\.js$/.test(asset.filePath)) {
            return;
          }

          let moduleExports = {};
          moduleExports['*'] = moduleExports[''] = {
            id: bundleGraph.getAssetPublicId(asset),
            chunks: [bundleGraph.getAssetPublicId(loader)],
            name: '*'
          };

          const href = pathToFileURL(asset.filePath).href;
          json[href] = moduleExports;
        });
      });
    }

    await options.outputFS.writeFile(
      path.join(options.projectRoot, 'dist', 'react-transport-manifest.json'),
      JSON.stringify(json, null, 2)
    );
  }
});
