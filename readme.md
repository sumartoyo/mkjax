# mkjax

A fork of [djax](https://github.com/beezee/djax).  
Load a page when clicking a link without full loading the page.
mkjax loads the page via ajax and replaces matching elements with elements from ajax response.
Just like [pjax](https://github.com/defunkt/jquery-pjax) but with some differences.

## Usage

page.html

    <script src="mkjax.js"></script>

    <div id="my-contents">
        ...
    </div>

    <script>
        mkjax('a.mkjaxify', '.updateable-container', {
            onClick: function(event, linkElement) {
                // this is called when clicking a link with matching selector
                return false; // returning false won't request the new page
            },
            onLoading: function(url) {
                // this is called when requesting a page via ajax
                return false; // returning false won't replace page elements
            },
            onDone: function(response) {
                // this is called after done replacing page elements
                // response is fetch response object
            },
            onFail: function(response, error) {
                // this is called when an error occured
                // error object may or may not exists
            },
            onAlways: function() {
                // this is always called, done or failed
            },
        });
    </script>

Inside `div#my-contents`

    <div>
        <div class="updatable-container" id="first">
            Here's a div that will be monitored for changes by mkjax.
            All updateable elements must have an ID.
        </div>
        <div class="updatable-container" id="second">
            Here's another div that will be monitored.
            <script>alert('scripts inside updatable-container will be executed')</script>
        </div>
    </div>
    <div>
        <ul class="updatable-container">
            <li>Everything in this sidebar...</li>
            <li>is also being tracked</li>
            <li><a class="mkjaxify" href="next-page.html">This will load the new page with ajax...</a></li>
            <li><a class="mkjaxify" href="about.html">without full loading the page</a></li>
            <li><a href="login.html">This is normal link, full page load without ajax</a></li>
        </ul>
    </div>

## More

Run [example](https://rawgit.com/sumartoyo/mkjax/master/example.html) and read the source code for more information.
