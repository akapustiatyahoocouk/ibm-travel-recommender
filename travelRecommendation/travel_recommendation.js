var navDivHtml =
    `<div class="Logo">
        <image class="LogoImage" src="images/logo.png"/>
        TravelBoom
    </div>
    <div class="TopDiv">
        <a class="TopMenu" href="travel_recommendation.html#top">Home</a>
        <a class="TopMenu" href="about_us.html#top">About us</a>
        <a class="TopMenu" href="#top">Contact us</a>
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