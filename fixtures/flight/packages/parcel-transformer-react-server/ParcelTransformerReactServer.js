const {Transformer} = require('@parcel/plugin');
const {parse} = require('@babel/parser');
const {simple} = require('@parcel/babylon-walk');
const {relativeUrl} = require('@parcel/utils');

// TODO: maybe do this in a resolver instead?
module.exports = new Transformer({
  async transform({asset, options}) {
    let code = await asset.getCode();
    let ast = parse(code, {
      sourceFilename: relativeUrl(options.projectRoot, asset.filePath),
      allowReturnOutsideFunction: true,
      strictMode: false,
      sourceType: 'module',
      plugins: ['jsx', 'exportDefaultFrom', 'exportNamespaceFrom', 'dynamicImport'],
    });

    simple(ast.program, {
      ImportDeclaration(node) {
        if (node.source.value.endsWith('.client.js')) {
          asset.addDependency({
            moduleSpecifier: node.source.value
          });
        }
      }
    });

    asset.isSplittable = true;
    asset.setCode('');
    return [asset];
  }
});
