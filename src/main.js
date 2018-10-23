/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const scenegraph  = require("scenegraph");
const storage = require("uxp").storage
const fs = require("uxp").storage.localFileSystem;
const application = require('application')
const Dialogs = require('./lib/dialogs')
const Folder = storage.Folder

/**
 *
 * @param {string} name
 * @returns {string}
 */
function filerName(name) {
  return name.replace(/[\\\/:*?"<>|#]/g, '-')
}

async function getDbJson(nodes) {
  let tempFolder = await fs.getTemporaryFolder();
  tempFolder = await tempFolder.createFolder(Math.random().toString(36).slice(2))
  let files = await Promise.all(
    nodes.map(node => tempFolder.createFile(filerName(node.name) + '.svg'))
  )
  let results = await application.createRenditions(nodes.map(
    (node, i) => {
      return {
        node: node,
        outputFile: files[i],
        type: application.RenditionType.SVG,
        scale: 2,
        minify: false,
        embedImages: true,
      }
    }
  ))
  let svgs = await Promise.all(
    files.map(f => f.read())
  )
  // svgs = svgs.map(
  //   svg => {
  //     if (typeof svg !== 'string') {
  //       svg = String.fromCharCode.apply(null, new Uint16Array(buf))
  //     }
  //     return svg
  //   }
  // )
  let svgList = svgs.map((svg, i) => ({
    svg,
    name: nodes[i].name,
  })).filter(s => s.svg && s.svg !== 'null' && s.name)
  return `
    window['__ARTBOARDS__'] = ${JSON.stringify(svgList)}
  `
}
/**
 *
 * @param {Folder} folder
 * @param {Folder} dist
 */
async function copyFolder(folder, dist) {
  let entries = await folder.getEntries()
  for (const entry of entries) {
    if (entry.isFile) {
      entry.copyTo(dist)
    } else {
      let d = await dist.createFolder(filerName(entry.name))
      copyFolder(/** @type {Folder} */ (entry), d)
    }
  }
}

/**
 *
 * @param {Folder} folder
 */
async function deleteFolder(folder) {
  let entries = await folder.getEntries()
  for (const entry of entries) {
    if (entry.isFile) {
      await entry.delete()
    } else {
      await deleteFolder(/** @type {Folder} */(entry))
    }
  }
  await folder.delete()
}
/**
 *
 * @param {Folder} folder
 * @param {string} name
 * @param {?number} i
 * @returns {Promise<Folder>}
 */
async function createAutoFolder(folder, name, i = 0) {
  /** @type {Folder} */
  let exportsFolder = undefined
  try {
    exportsFolder = await folder.createFolder(name + (i ? '_' + i : ''))
  } catch (error) {
    console.error(error)
    return createAutoFolder(folder, name, i + 1)
  }
  return exportsFolder
}

/**
 *
 * @param {any} nodes
 * @param {string} name
 */
async function saveNodes(nodes, name) {
  name = name.replace(/\W+/g, '-')
  let folder = await fs.getFolder();
  if (!folder) {
    return
  }
  // folder = await folder.createFolder(node.name)
  let pluginFolder = await fs.getPluginFolder()

  let statics = /** @type {Folder} */ (await pluginFolder.getEntry('assets/static-plugin'))
  /** @type {Folder} */
  let exportsFolder = await createAutoFolder(folder, name)
  await copyFolder(statics, exportsFolder)
  let dbJson = await getDbJson(nodes)
  let dist = /** @type {Folder} */(await exportsFolder.getEntry('dist'))
  let dbFile = await dist.createFile('db.js')
  await dbFile.write(dbJson)
}

async function exportCurrentArtboard(selection, documentRoot) {
  // console.log('application.appLanguage', application.appLanguage)
  let items = selection.itemsIncludingLocked
  if (!items.length) {
    return Dialogs.alert('No nodes are selected, please select some nodes.')
  }
  await saveNodes(items, documentRoot.name || items[0].name || 'inker8-exports')
}

async function exportAllArtboards(selection, documentRoot) {
  let items = []

  documentRoot.children.forEach(
    (child, i) => {
      items[i] = child
    }
  )
  // console.log('documentRoot.name', documentRoot.name)
  if (!items.length) {
    return Dialogs.alert('No artboards are in document, please create some artboards.')
  }
  await saveNodes(items, documentRoot.name || items[0].name || 'inker8-exports')
}

module.exports = {
  commands: {
    exportCurrentArtboard,
    exportAllArtboards
  }
};
