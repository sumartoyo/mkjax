jQuery('document').ready(function($) {
    $(document.body).mkjax('a.mkjaxify', '.mkjaxable');

    $(window).bind('mkjax:loading', function(event, params) {
      // console.log(params.url);
      $('#main').css('filter', 'blur(2px)');
    });

    $(window).bind('mkjax:success', function(event, params) {
      // console.log(params.url);
      // console.log(params.title);
      // console.log(params.html);
    });

    $(window).bind('mkjax:fail', function(event, params) {
      // console.log(params.url);
      // console.log(params.html);
    });

    $(window).bind('mkjax:always', function(event, params) {
      // console.log(params.url);
      // console.log(params.html);
      $('#main').css('filter', '');
    });
});
