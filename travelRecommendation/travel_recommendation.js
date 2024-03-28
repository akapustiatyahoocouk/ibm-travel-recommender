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
    <div class="SearchBar">
        <form class="SearchForm">
            <input type="text" id="SearchInput">
            <button id="SubmitButton" type="submit">Search</button>
            <button id="ResetButton">Reset</button>
        </form>
    </div>`;
document.querySelector( '#home' ).innerHTML = navDivHtml;
    
var iconAreaHtml =
    `<a href="https://www.facebook.com/">
        <image class="PageIcon" src="images/facebook.png"/>
    </a>`;
document.querySelector( '#PageIcons' ).innerHTML = iconAreaHtml;

function goToTeamMember(name) {
    alert("Going to team member " + name);
}

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



staticJson =
`
{
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
console.log(json);
  
plurals = {
    "beach": "beaches",
    "country": "countries",
    "city": "cities",
    "temple": "temples",
};

function isLocationJsonNode(node) {
    return ("name" in node) &&
           ("imageUrl" in node) &&
           ("description" in node);
}

class Location {
    constructor(name, imageUrl, description, context) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.context = 
            context.split('.')
                   .map(c =>
                        {
                            let parts = /^(.+)\[\d+\]$/.exec(c);
                            return (parts == null) ? c : parts[1];
                        });

        console.log('    LOCATION name: ' + this.name);
        console.log('    LOCATION imageUrl: ' + this.imageUrl);
        console.log('    LOCATION description: ' + this.description);
        console.log('    LOCATION context: ' + this.context.toString());
    }
    
    match(wordsToSearch) {
        wordsToSearch = this.removeDuplicates(wordsToSearch);
        console.log(wordsToSearch);
        let wordsMatched = 0;
        for (let i = 0; i < wordsToSearch.length; i++) {
            let word = wordsToSearch[i];
            console.log('word = ' + word);
            if (this.name.toLowerCase().includes(word.toLowerCase())) {
                wordsMatched++;
            } else if (this.description.toLowerCase().includes(word.toLowerCase())) {
                wordsMatched++;
            } else if (this.context.includes(word.toLowerCase())) {
                wordsMatched++;
            }
        }
        return wordsMatched == wordsToSearch.length;
    }

    removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }
}

var locations = [];

function processJsonNode(context, node) {
    //console.log('PROCESSING ' + context);
    if (Array.isArray(node)) {
        //console.log(context + " is array, length = " + node.length);
        for (let i = 0; i < node.length; i++) {
            processJsonNode(context + '[' + i + ']', node[i]);
        }
    } else if (typeof(node) == "object") {
        //console.log(context + ' is ' + typeof(json));
        for (prop in node) {
            //console.log('property found ' + prop);
            let propContext = (context.length == 0) ? prop : (context + '.' + prop);
            processJsonNode(propContext, node[prop]);
        }
        if (isLocationJsonNode(node)) {
            console.log('LOCATION FOUND: ' + context);
            let location = new Location(node["name"], 
                                        node["imageUrl"], 
                                        node["description"],
                                        context);
            locations.push(location);
        }
    }
}
processJsonNode("", json);

console.log(locations);
console.log(locations[0].match(['sydney', 'countries', 'sydney', 'country']));