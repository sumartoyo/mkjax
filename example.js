(function() {
  mkjax('a.mkjaxify', '.mkjaxable', {
    onLoading: function(url) {
      document.getElementById('main').style.filter = 'blur(2px)';
    },
    onAlways: function() {
      document.getElementById('main').style.filter = '';
    }
  });
})();
