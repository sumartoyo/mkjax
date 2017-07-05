# mkjax

A modification of [djax](https://github.com/beezee/djax).  
Load a page when clicking a link without full loading the page.
mkjax loads the page via ajax and replaces current page contents with the contents from ajax response.
Just like [pjax](https://github.com/defunkt/jquery-pjax) but a little bit different.

## Basic usage

mkjax is very quick to set up, with a few markup requirements to let it work smoothly.

First include it in your header after jquery:

    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script type="text/javascript" src="jquery.mkjax.js"></script>
    
Then instantiate on the largest page element where you will have updating content. 'body' is typically the way to go with this:

    <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('body').mkjax('a.mkjaxify', 'div.updatable-container');
        });
    </script>
    
Congrats, you're done! Well mostly...

## Markup

mkjax will track elements with the class you pass it as a first argument. In the above example I've passed the class 'updatable-container,' so my markup would look something like this:

    <body>
        <div class="wrapper" id="main">
            <div class="updatable-container first" id="first">
                Here's a div that will be monitored for changes by mkjax.
            </div>
            <div class="updatable-container second" id="second">
                Here's another.
                <script>alert('scripts inside updatable-container will be executed')</script>
            </div>
        </div>
        <div class="sidebar" id="sidebar-right">
            <ul class="updatable-container sidebar-list">
                <li>Everything in this sidebar...</li>
                <li>is also being tracked</li>
                <li>Some pages might not have this ul</li>
                <li>That's fine, it just won't show on them</li>
            </ul>
        </div>
        
Your markup can be laid out however you like, and your trackable sections can be anywhere in relation to one another. It's best to keep them top level (nesting is unnecessary and unsupported,) and
there are a few requirements that allow the plugin to function properly.

### IDs

Trackable elements must all have IDs. This is how the requested page is matched up with the current page. Only trackable elements that differ between the two pages will be loaded.

## Events

    $(window).bind('mkjax:loading', function(event, params) {
        // when requesting a page
        console.log(params.url);
    });

    $(window).bind('mkjax:done', function(event, params) {
        // when done successfully
        console.log(params.url);
        console.log(params.title);
        console.log(params.html);
    });

    $(window).bind('mkjax:fail', function(event, params) {
        // when fail
        console.log(params.url);
        console.log(params.html);
    });

    $(window).bind('mkjax:always', function(event, params) {
        // always called, done or failed
        console.log(params.url);
        console.log(params.html);
    });

## More

Run [example](https://rawgit.com/sumartoyo/mkjax/master/index.html) and read the source code for more information.
