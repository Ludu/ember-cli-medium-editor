/* jshint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const fbTransform = require('fastboot-transform');

module.exports = {
  name: 'ember-cli-medium-editor',

  included: function(app) {
    this._super.included.apply(this, arguments);

    var options = app.options.mediumEditorOptions || {};

    this.import('vendor/medium-editor/js/medium-editor.min.js');
    this.import('vendor/shims/medium-editor.js');

    if (!options.excludeBaseStyles) {
      this.import('vendor/medium-editor/css/medium-editor.min.css');
    }

    if (options.theme) {
      this.import('vendor/medium-editor/css/themes/' + options.theme + '.min.css');
    } else if (options.theme !== false) {
      this.import('vendor/medium-editor/css/themes/default.min.css');
    }
  },

  treeForVendor(vendorTree) {
    var distPath = path.resolve(require.resolve('medium-editor'), '..', '..');

    if (fs.existsSync(distPath)) {
      var mediumEditorTree = new Funnel(distPath, {
        include: ['**/*'],
        destDir: 'medium-editor'
      });
      return new MergeTrees([vendorTree, fbTransform(mediumEditorTree)]);
    } else {
      return vendorTree;
    }
  },

  // use ember-simple-auth approach 
  // https://github.com/simplabs/ember-simple-auth/blob/1ca4ae678b7be9905076762220dcd9fcb0f27ac0/index.js#L24-L39
  _ensureThisImport: function() {
    if (!this.import) {
      this._findHost = function findHostShim() {
        var current = this;
        var app;
        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));
        return app;
      };
      this.import = function importShim(asset, options) {
        var app = this._findHost();
        app.import(asset, options);
      };
    }
  }
};
