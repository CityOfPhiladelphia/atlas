Atlas
-----
_Note: this is a mockup/proof of concept only._

Explore addresses in the City of Philadelphia. Find information about property ownership, zoning/land use, city services, and nearby facilities such as parks, schools, and polling places. An interactive map allows you to navigate the city to learn more about the locations that interest you. This is intended as a unified point of access for City websites such as the Property Search, Parcel Explorer, Zoning Archive, and other location-based apps.

### Required

* Hosted - Ideally serverless application
  * Need an internal city and public versions
* Mobile – Must be compatible with most mobile devices
* Fast – Must be a joy for the users to use the app. Extensive caching and background processing should be used. 
* Printing - User must be able to print well formatted documents from html or pdf based upon the active panel (map optional)
* Sharing - Users must be able to share current map and active panel info through a url
* Geocoding - Single address entry box that will handle addresses, intersections, act numbers, possible blocks, point of interest/gazetteer (lookup by place name)
  * ambiguous addresses like ties (100 broad st) needs to prompt user to pick from options
* Direct Information via ULR - Ability to make url calls to specific accordion panels (www.atlas.phila.gov/address/1234 market st/trash)
* Context Aware - When accordion panel is activated, map is context sensitive - display layers related to panel
* Basemaps - Intuitive basemap toggling - no checkboxes
* Imagery - Ability to see historic imagery basemaps via slider
* Seamless Map and Panel Experience - Intuitive interaction between clicking on map and info displayed in panel
* Additional Content - Need to be able to scroll within panels if there is more info than fits in one screen
* Abstract Web Map from Application – Developers will not manage the map services but instead read config information from AGO webmaps via json 
* Downloads - Links to open data for downloading
* Browsers - Must be tested and work well will all major browsers.  This includes IE.
* Other Imagery - Design for including access to street level and oblique imagery

### Nice to have

* Usage Aware - Accordion boxes sort according to google analytics, most used at top
* Routing - items where there is a nearest facility (parks, voting) have ability to route between locations on map
* Filtering - for layers that are time-based events, need simple filtering tools to modify what is displayed on map
