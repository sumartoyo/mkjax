(function() {
  mkjax('a.mkjaxify', '.mkjaxable', {
    onClick: function(submitEvent, linkElement) {
      document.getElementById('main').style.filter = 'blur(2px)';
    },
    onAlways: function() {
      document.getElementById('main').style.filter = '';
    }
  });
})();
