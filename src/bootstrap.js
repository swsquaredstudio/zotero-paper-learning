var IvarPaperExport;
var chromeHandle;
function install() {}
function uninstall() {}
async function startup({ rootURI }) {
  await Zotero.initializationPromise;
  const addonStartup = Components.classes['@mozilla.org/addons/addon-manager-startup;1']
    .getService(Components.interfaces.amIAddonManagerStartup);
  chromeHandle = addonStartup.registerChrome(
    Services.io.newURI(rootURI + 'manifest.json'),
    [['content', 'ivar-paper-learning', './']]
  );
  Services.scriptloader.loadSubScript(rootURI + 'core.js');
  Services.scriptloader.loadSubScript(rootURI + 'notes.js');
  Services.scriptloader.loadSubScript(rootURI + 'plugin.js');
  IvarPaperExport.rootURI = rootURI;
  for (const window of Zotero.getMainWindows()) IvarPaperExport.add(window);
}
function onMainWindowLoad({ window }) { IvarPaperExport?.add(window); }
function onMainWindowUnload({ window }) { IvarPaperExport?.remove(window); }
function shutdown() {
  for (const window of Zotero.getMainWindows()) IvarPaperExport?.remove(window);
  chromeHandle?.destruct();
  chromeHandle = undefined;
  IvarPaperExport = undefined;
}
