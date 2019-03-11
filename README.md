# Xunit Viewer

![Icon](https://raw.githubusercontent.com/lukejpreston/xunit-viewer/master/XunitViewerIcon.png)

[![npm version](https://badge.fury.io/js/xunit-viewer.svg)](https://badge.fury.io/js/xunit-viewer)
[![Downloads on npm](http://img.shields.io/npm/dm/xunit-viewer.svg)](https://www.npmjs.com/package/xunit-viewer)

Takes your XMl xunit results and then turns it into a nice single HTML file

Have a look at the [demo](https://lukejpreston.github.io/xunit-viewer/)

## CLI

You can use xunit-viewer from the command line

First install it

`npm i -g xunit-viewer`

Then run it

`xunit-viewer`

you can also run it with these optional params, see the next section for what they default to

```bash
--results=file_or_folder
--ignore=pattern_a,pattern_b,pattern_c
--output=file_or_folder_or_console
--title="The title"
--port=8080
--watch
--color=false
--filter.suites.value="Suite names matching this value"
--filter.suites.types=all,pass,fail,skip,error,unknown
--filter.tests.value="Test names matching this value"
--filter.tests.types=all,pass,fail,skip,error,unknown
--filter.properties.value="Properties matching with key or value matching this value"
--filter.properties.types=all
```

## Node

If you want to run this from a node script instead of command line first install it

`npm i -D xunit-viewer`

Then from your scripts do the following

```js
const XunitViewer = require('xunit-viewer')
const result = XunitViewer({
    results: '',
    suites: [],
    xml: '',
    ignore: [],
    output: false,
    title: 'Xunit Viewer',
    port: false,
    watch: false,
    color: true,
    filter: {},
    format: 'html'
})
```

all are optional, those are default values

* `results` the file or folder where the results are, defaults to where the cli is running from i.e. `process.cwd()`
* `suites` you can pass the JSON format in after using the parser
* `xml` you can pass the xml string in
* `ignore` an array of patterns to ignore or a single string with a pattern to ignore
* `output` if folder will save a file `xunit-viewer.html` to that folder, if a file will save to that file if `'console'` then it will spit out the results to the console
* `title` title for the HTML
* `port` if `false` it will not start a server, otherwise it will start serving the output and not save not save a file unless you also provide `output`
* `watch` will re run the cli when anything in `results` changes, if you have a port it will also update that via websockets
* `color` if `output === 'console'` then it will either be in color or not
* `filter` will filter out `suites`, `tests` and `properties` from the console output example
```json
{
    "suites": {
        value: "Suite names matching this value",
        type: ["all", "pass", "fail", "skip", "error", "unknown"],
    },
    "tests": {
        value: "Test names matching this value",
        type: ["all", "pass", "fail", "skip", "error", "unknown"],
    },
    "properties": {
        value: "Properties matching with key or value matching this value",
        type: ["all"]
    },
}
```
* `format` default to `html` which is the full HTML file, but you can also choose `json` if you want to use that json for your own view

if any value is invalid it will try and use default

## Component

If you require Component please raise an issue. It was available in v5 (according to the docs, but no way would it have worked)

## TODO

* add a repl
* meta data for slack
* make better stub data
* better error handling
* set up something which will parse in browser
* clean everything and write some more tests

# This is the new Xunit Viewer v6

I will try to maintain the old API, I would be interested in finding out what people actually use but who cares

1. run build and turn that into a single html file
2. when people people use the command line all it would do is put the json in the html file and return that, this will be tons quicker

have to change the data using the following

```json
{
    "files": [{
        "filename": "file-1.xml",
        "data": "xml",
        "suites": [{
            "tests": [],
            "properties": []
        }]
    }]
}
```