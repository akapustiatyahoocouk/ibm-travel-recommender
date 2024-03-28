//////////
//  Reusable web page fragments - don't duplicate in every page
var navDivHtml =
    `<div class="Logo">
        <image class="LogoImage" src="images/logo.png"/>
        TravelBoom
    </div>
    <div class="TopDiv">
        <a class="TopMenu" href="travel_recommendation.html#top">Home</a>
        <a class="TopMenu" href="about_us.html#top">About us</a>
        <a class="TopMenu" href="contact_us.html#top">Contact us</a>
    </div>
    <div class="SearchBar">`;
    if (typeof(includeSearchBarInNavBar) != 'undefined' && includeSearchBarInNavBar) {
        navDivHtml += 
            `<form class="SearchForm">
                <input type="text" id="SearchInput" onkeyup="trackSearchButtonState()">
                <button id="SubmitSearchButton" type="submit" onclick="search()">Search</button>
                <button id="ResetButton" onclick="resetSearchResults()">Reset</button>
            </form>`;
    }
    navDivHtml += `</div>`;
document.querySelector( '#home' ).innerHTML = navDivHtml;
    
var iconAreaHtml =
    `<a href="https://www.facebook.com/">
        <image class="PageIcon" src="images/facebook.png"/>
    </a>`;
document.querySelector( '#PageIcons' ).innerHTML = iconAreaHtml;

//////////
//  "About us" page support
function goToTeamMember(name) {
    alert("Going to team member " + name);
}

//////////
//  "Contact us" page support
function trackSubmitContactRequestButtonState() {
    let contactUsName = document.getElementById("ContactUsName").value.trim();
    let contactUsEmail = document.getElementById("ContactUsEmail").value.trim();
    let contactUsMessage = document.getElementById("ContactUsMessage").value.trim();
    let submitButton = document.getElementById("SubmitContactRequestButton");
    submitButton.disabled =
        (contactUsName.length == 0 ||
         contactUsEmail.length == 0 ||
         contactUsEmail.indexOf('@') <= 0 || 
         contactUsEmail.indexOf('@') == contactUsEmail.length - 1 ||
         contactUsEmail.indexOf('@') != contactUsEmail.lastIndexOf('@') ||
         contactUsMessage.length == 0)? 1 : 0;
}

function submitContactRequest() {
    //  Locate relevant input fields...
    let contactUsName = document.getElementById("ContactUsName");
    let contactUsEmail = document.getElementById("ContactUsEmail");
    let contactUsMessage = document.getElementById("ContactUsMessage");
    //  ...submit contact request (AJAX?)...
    alert("Submitting contact request\n" +
          "name = " + contactUsName.value + "\n" +
          "email = " + contactUsEmail.value + "\n" +
          "message = " + contactUsMessage.value);
    //    ...and reset the form
    contactUsName.value = "";
    contactUsEmail.value = "";
    contactUsMessage.value = "";
}


//////////
//  Search logic

//  TODO load from JSON file via fetch()!!!
staticJson =
`{
    "countries": [
      {
        "id": 1,
        "name": "Australia",
        "cities": [
          {
            "name": "Sydney, Australia",
            "imageUrl": "enter_your_image_for_sydney.jpg",
            "description": "A vibrant city known for its iconic landmarks like the Sydney Opera House and Sydney Harbour Bridge."
          },
          {
            "name": "Melbourne, Australia",
            "imageUrl": "enter_your_image_for_melbourne.jpg",
            "description": "A cultural hub famous for its art, food, and diverse neighborhoods."
          }
        ]
      },
      {
        "id": 2,
        "name": "Japan",
        "cities": [
          {
            "name": "Tokyo, Japan",
            "imageUrl": "enter_your_image_for_tokyo.jpg",
            "description": "A bustling metropolis blending tradition and modernity, famous for its cherry blossoms and rich culture."
          },
          {
            "name": "Kyoto, Japan",
            "imageUrl": "enter_your_image_for_kyoto.jpg",
            "description": "Known for its historic temples, gardens, and traditional tea houses."
          }
        ]
      },
      {
        "id": 3,
        "name": "Brazil",
        "cities": [
          {
            "name": "Rio de Janeiro, Brazil",
            "imageUrl": "enter_your_image_for_rio.jpg",
            "description": "A lively city known for its stunning beaches, vibrant carnival celebrations, and iconic landmarks."
          },
          {
            "name": "São Paulo, Brazil",
            "imageUrl": "enter_your_image_for_sao-paulo.jpg",
            "description": "The financial hub with diverse culture, arts, and a vibrant nightlife."
          }
        ]
      }
    ],
    "temples": [
      {
        "id": 1,
        "name": "Angkor Wat, Cambodia",
        "imageUrl": "enter_your_image_for_angkor-wat.jpg",
        "description": "A UNESCO World Heritage site and the largest religious monument in the world."
      },
      {
        "id": 2,
        "name": "Taj Mahal, India",
        "imageUrl": "enter_your_image_for_taj-mahal.jpg",
        "description": "An iconic symbol of love and a masterpiece of Mughal architecture."
      }
    ],
    "beaches": [
      {
        "id": 1,
        "name": "Bora Bora, French Polynesia",
        "imageUrl": "enter_your_image_for_bora-bora.jpg",
        "description": "An island known for its stunning turquoise waters and luxurious overwater bungalows."
      },
      {
        "id": 2,
        "name": "Copacabana Beach, Brazil",
        "imageUrl": "enter_your_image_for_copacabana.jpg",
        "description": "A famous beach in Rio de Janeiro, Brazil, with a vibrant atmosphere and scenic views."
      }
    ]
  }`;
const json = JSON.parse(staticJson);
//console.log(json);
  
//  TODO load from JSON file via fetch()!!!
synonyms =
[   //  An array of "synonym clusters"
    ["beach", "beaches"],
    ["country", "countries"],
    ["city", "cities"],
    ["temple", "temples"]
];
//console.log(synonyms);

//  Breaks phrases into lists of words, suppressing punctuation (so e.g.
//  "Sydney, Australia" is broken as ["Sydney", "Australia"].
//  Lowercasing comes separately if and as required.
function wordize(phrase) {
    return phrase.replaceAll('.', ' ')
                 .replaceAll(',', ' ')
                 .replaceAll('?', ' ')
                 .replaceAll('!', ' ')  //  TODO what else?
                 .split(' ')
                 .filter((item,index) => item.length > 0);
}

//  Returns a copy of the argument array but without duplicates
function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

//  A JSON node is considered to represent a "location:" if it
//  has a name, a description and a imageUrl, all strings
function isLocationJsonNode(node) {
    return ("name" in node) && typeof(node["name"] == "string") &&
           ("imageUrl" in node) && typeof(node["imageUrl"] == "string") &&
           ("description" in node && typeof(node["description"] == "string"));
}

function enrichWithSynonyms(wordList) {
    let result = [].concat(wordList);
    for (const word of wordList) {
        //console.log("WORD = " + word);
        for (const cluster of synonyms) {
            //console.log("CLUSTER = " + cluster);
            if (cluster.includes(word)) {
                result = result.concat(cluster);
                //console.log("RESULT IS NOW " + result);
            }
        }
    }
    return removeDuplicates(result);
}

//  Represents a single findable Location
class Location {
    constructor(name, imageUrl, description, context, inheritedKeywords) {
        this.name = name;               //  "as is" in the JSON
        this.imageUrl = imageUrl;       //  "as is" in the JSON
        this.description = description; //  "as is" in the JSON
        this.context = //   e.g. ["countries", "cities"] or ["beaches"] - i.e. a location category
            context.split('.')
                   .map(c =>
                        {
                            let parts = /^(.+)\[\d+\]$/.exec(c);
                            return (parts == null) ? c : parts[1];
                        });
        this.allKeywords =  //  search for every word must match any one of these
            removeDuplicates(
                enrichWithSynonyms(
                    wordize(name).concat(wordize(description))
                                 .concat(this.context)
                                 .concat(inheritedKeywords))
                    .map(w => w.toLowerCase()));
 
        //console.log('    LOCATION name: ' + this.name);
        //console.log('    LOCATION imageUrl: ' + this.imageUrl);
        //console.log('    LOCATION description: ' + this.description);
        //console.log('    LOCATION context: ' + this.context.toString());
        //console.log('    LOCATION all keywords: ' + this.allKeywords.toString());
    }
    
    //  Does this Location "match" a list of the specified search words ?
    match(wordsToSearch) {
        wordsToSearch =
            removeDuplicates(
                wordsToSearch.map(w => w.toLowerCase())
                .filter((item,index) => item.length > 2)); //  don't search for "a" or "of"
        //console.log("SEARCHING FOR WORDS " + wordsToSearch);
        let wordsMatched = 0;
        for (const word of wordsToSearch) {
            //console.log("SEARCHING FOR WORD " + word);
            if (this.allKeywords.includes(word.toLowerCase())) {
                //console.log("MATCHED  WORD " + word);
                wordsMatched++;
            }
        }
        return wordsMatched == wordsToSearch.length;
    }
}

//  Build a list of all known locations
//  TODO use a Promise/async in a real site!!!
var locations = [];

function processJsonNode(context, node, inheritedKeywords) {
    //console.log('PROCESSING ' + context);
    if (Array.isArray(node)) {
        //console.log(context + " is array, length = " + node.length);
        //  Must process every array element, updating "context"
        //  for each array element accordingly
        for (let i = 0; i < node.length; i++) {
            processJsonNode(context + '[' + i + ']', node[i], inheritedKeywords);
        }
    } else if (typeof(node) == "object") {
        //console.log(context + ' is ' + typeof(json));
        if (isLocationJsonNode(node)) {
            //  This is an object representing a location
            //console.log('LOCATION FOUND: ' + context);
            let location = new Location(node["name"], 
                                        node["imageUrl"], 
                                        node["description"],
                                        context,
                                        inheritedKeywords);
            locations.push(location);
        } else {
            //  Any property of an object can be another object or an array
            //  of objects, and an actual Location may be some levels beneath.
            //  If, however, this object has a "name" and/or "description" property,
            //  words there must become "inherited keywords" for child objects.
            let inheritedChildKeywords = inheritedKeywords;
            if ("name" in node) {
                //  I.e. if a country is 'Ja[an', then every Location therein should
                //  be findable when searching for 'Japan'.
                inheritedChildKeywords = 
                    inheritedChildKeywords.concat(wordize(node["name"]));
            }
            if ("description" in node) {
                //  I.e. if a Country nde has a description "...ragged beauty..."
                //  then all Locations in this Country should be findable when
                //  searching for "ragged beauty".
                inheritedChildKeywords = 
                    inheritedChildKeywords.concat(wordize(node["description"]));
            }
            for (property in node) {
                //console.log('property found ' + property);
                let propertyContext = (context.length == 0) ? property : (context + '.' + property);
                processJsonNode(propertyContext, node[property], inheritedChildKeywords);
            }
        }
    }
}
processJsonNode("", json, []);

console.log("===== LOADED LOCATIONS =====");
console.log(locations);
//  TODO the "for" below is a debug code! kill off when done debugging
for (const loc of locations) {
    if (loc.match(['Australia'])) {
        console.log(loc.name);
    }
}

//////////
//  TODO implement the "book now" logic
function bookNow() {
    alert('Book NOW!!!');
}

//////////
//  "Search" UI

//  Resets the "search" box and hides all search results
function resetSearchResults() {
    document.getElementById("SearchInput").value = "";
}

//  Enables or disables "Search" button sepending on whether Search//   criteria are empty or noe
function trackSearchButtonState() {
    let searchCriteria = document.getElementById("SearchInput").value.trim();
    let submitButton = document.getElementById("SubmitSearchButton");
    submitButton.disabled = (searchCriteria.length == 0);
}
if (typeof(includeSearchBarInNavBar) != 'undefined' && includeSearchBarInNavBar) {
    trackSearchButtonState();   //  ...to set up initial Search button state when the page loads
}

//  Performs the search
function search() {
    alert('Searching for ' + document.getElementById("SearchInput").value);
}