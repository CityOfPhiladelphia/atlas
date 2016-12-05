function isElementInViewport(par, el) {
    var elRect = el.getBoundingClientRect(),
        parRect = par.getBoundingClientRect();
    return (
        elRect.top >= parRect.top &&
        elRect.left >= parRect.left &&
        elRect.bottom <= parRect.bottom &&
        elRect.right <= parRect.right
    );
}

function FindByAttributeValue(attribute, value)    {
  var All = document.getElementsByTagName('*');
  for (var i = 0; i < All.length; i++)       {
    if (All[i].getAttribute(attribute) == value) { return All[i]; }
  }
}

function check(row) {
    var container = document.getElementById('topic-panel'),
      //container2 = $('#topic-panel'),
      //theRow = $('[data-id ='+row+']'),
      theRow = FindByAttributeValue('data-id', row),
    //var container = document.getElementById("boundary"),
        //tr = container.getElementsByTagName("tr"),
        visible = [],
        i, j, cur;
    //for (i = 0, j = tr.length; i < j; i++) {
        //cur = tr[i];
        console.log(container);
        console.log(theRow);
        if (isElementInViewport(container, theRow)) {
            //visible.push(theRow);
            console.log('row ' + row + ' is visible');
        } else {
          console.log('row ' + row + ' is not visible');
          var container2 = $('#topic-panel');
          var theRow2 = $('[data-id ='+row+']');
          theRow2.get(0).scrollIntoView();
          //if (theRow2.length){
            //tp.scrollTop(theRow.offset().top - (tp.height()/2));
          //container2.scrollTop(theRow2.top)//offset().top)// - theRow2.offset().top/5);
          //}
        }
    //}
    //console.log("Visible rows:", visible.join(", "));
}

/*
function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

addEvent(window, "load", function () {
    addEvent(document.getElementById("check_btn"), "click", check);
    addEvent(document.getElementById("boundary"), "scroll", check);
});
*/
