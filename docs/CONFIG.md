# Configuration

Most configuration is done through the `./src/config.json` file.
This file contains an annotated version of the sample `config.json` in the Treebank Template repository.

## JSON

```javascript
{
  // Title of the collection: displayed on the homepage and in the header
  "title": "Treebank Publication Template",

  // Subtitle (optional): shown below the title on the homepage; accepts Markdown 
  "subtitle": "Template for publishing collections of treebanks. See the [repository](https://github.com/perseids-publications/treebank-template/) for more information and documentation. If you would like to create a template with your own treebanks, send us a [message](https://docs.google.com/forms/d/e/1FAIpQLSf8yf6B3xlV31x0JKquRuIdXd6LVuX0V7I7id7ZLXbMwDo-UA/viewform).",

  // Digital Object Identifier (optional): a DOI link; displayed in footer
  "doi": "https://dx.doi.org/10.5281/zenodo.3827931",

  // Copyright or ownership notice (optional): displayed in the footer; if not supplied, defaults to "The Perseids Project"
  "copyright": "The Perseids Project",

  // Report link (optional): link to where users report issues; usually the GitHub issues page
  "report": "https://github.com/perseids-publications/treebank-template/issues",

  // GitHub link (optional): link to the GitHub repository; if not supplied, defaults to "https://github.com/perseids-project"; to remove the icon set it to ""
  "github": "https://github.com/perseids-publications/treebank-template/",

  // Twitter link (optional): link to a Twitter account; if not supplied, defaults to "https://twitter.com/PerseidsProject"; to remove the icon set it to ""
  "twitter": "https://twitter.com/PerseidsProject",

  // Collections: the array of collections must have one or more members
  // Each collection must have a title as well as text or an array of publications (or both)
  "collections": [
    {
      // Title: displayed above the collection content
      "title": "Information",

      // Text: text describing the collection; accepts Markdown
      "text": "The Treebank Template is maintained by the Perseids Project. Visit [our homepage](https://www.perseids.org) to learn more."
    },
    {
      // Title: displayed above the collection content
      "title": "Collection 1", 

      // Publications: the array of publications
      // Each publication represents one work (e.g. Lysias' On the Murder of Eratosthenes) and can contain multiple treebanks
      "publications": [
        {
          // Path: the URL path used for the publication (must be unique)
          "path": "on-the-murder-of-eratosthenes",

          // Author: author of the publication
          "author": "Lysias",

          // Work: name of the work
          "work": "On the Murder of Eratosthenes",

          // Editors: editor(s) for the treebank; can be either a string or an array (see Philippic 1 below for an example of an array)
          "editors": "Vanessa Gorman",

          // Sections: array of treebanks
          "sections": [
            {
              // Locus: loci covered by this particular treebank
              "locus": "1-50",

              // Path: URL path used for this treebank (must be unique)
              "path": "on-the-murder-of-eratosthenes-1-50",

              // XML: the path to the XML file in the "public/xml" directory
              "xml": "lysias-1-1-50.xml",

              // Link (optional): a link to more information about the treebank
              "link": "https://www.example.com",

              // Notes (optional): notes about the treebank; accepts Markdown
              "notes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

              // Chunks: the "id" attributes of the "<sentence>" elements in the XML
              // It can either contain a "start" and "end" if the "id"s are a sequence of integers or it can be an array (see Philippic 1 below for an example of an array)
              "chunks": { "start": 1, "end": 134 }
            }
          ]
        },
        {
          "path": "on-the-crown",
          "author": "Demosthenes",
          "work": "On the Crown",
          "editors": "Vanessa Gorman",
          "sections": [
            {
              "locus": "1-50",
              "path": "on-the-crown-1-50",
              "xml": "demosthenes-18-1-50.xml",
              "notes": "Lorem ipsum dolor sit amet, *consectetur* adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              "chunks": { "start": 1, "end": 160 }
            },
            {
              "locus": "51-100",
              "path": "on-the-crown-51-100",
              "xml": "demosthenes-18-51-100.xml",
              "chunks": { "start": 1, "end": 149 }
            }
          ]
        }
      ]
    },
    {
      "title": "Collection 2",
      "publications": [
        {
          "path": "histories",
          "author": "Herodotus",
          "work": "The Histories",
          "editors": "Vanessa Gorman",
          "sections": [
            {
              "locus": "40-59",
              "path": "histories-40-59",
              "xml": "herodotus-1-40-59.xml",
              "chunks": { "start": 1, "end": 100 }
            },
            {
              "locus": "60-79",
              "path": "histories-60-79",
              "xml": "herodotus-1-60-79.xml",
              "chunks": { "start": 1, "end": 166 }
            },
            {
              "locus": "80-99",
              "path": "histories-80-99",
              "xml": "herodotus-1-80-99.xml",
              "notes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              "chunks": { "start": 1, "end": 185 }
            }
          ]
        },
        {
          "path": "philippic",
          "author": "Demosthenes",
          "work": "Philippic 1",
          "editors": [
            "Robert Gorman",
            "Vanessa Gorman"
          ],
          "sections": [
            {
              "locus": "1-51",
              "path": "philippic-1-51",
              "xml": "demosthenes-4-phil1-bu1.xml",
              "chunks": { "numbers": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159"] }
            }
          ]
        }
      ]
    }
  ]
}
```
