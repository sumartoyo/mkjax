/*
* mkjax
* https://github.com/sumartoyo/mkjax
*
* @version v0.1
* Released under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*
* mkjax is a fork of djax
* djax Copyright 2012, Brian Zeligson
* http://beezee.github.com/mkjax.html
*
*/

var noop = function() {};

var mkjax = function(linkSelector, blockSelector, handlers) {
  if (!('history' in window)) {
    console.log('no history object in window, mkjax fallbacks to normal links.');
    return;
  }

  handlers = handlers instanceof Object ? handlers : {};

  var self = {
    xhr: { abort: noop },
  };

  self.replaceBlocks = function(url, isPushState, html) {
    var bodyMatches = /<body[^>]*>([\s\S.]*)<\/body>/i.exec(html);
    if (!(bodyMatches)) {
      return;
    }

    var title;
    // get title
    var headMatches = /<head[^>]*>([\s\S.]*)<\/head>/i.exec(html);
    if (headMatches) {
      var headNode = document.createElement('head');
      headNode.innerHTML = headMatches[1];
      var titleNode = headNode.querySelector('title');
      if (titleNode) {
        title = titleNode.textContent.trim();
      }
    }
    title = title || document.title;

    if (isPushState) {
      history.pushState({
        'url' : url,
        'title' : title
      }, title, url);
    }

    // Set page title as new page title
    document.title = title;

    var bodyNode = document.createElement('body');
    bodyNode.innerHTML = bodyMatches[1];
    var newBlocks = bodyNode.querySelectorAll(blockSelector);
    newBlocks.forEach(function(newBlock) {
      var id = newBlock.getAttribute('id');
      if (!(id)) return;

      var oldBlock = document.getElementById(id);
      if (!(oldBlock)) return;

      var newScripts = newBlock.querySelectorAll('script');
      // detach scripts
      newScripts.forEach(function(script) {
        script.parentNode.removeChild(script);
      });

      // attach click listener
      self.bindLinks(newBlock.querySelectorAll(linkSelector));
      // replace with new
      oldBlock.parentNode.replaceChild(newBlock, oldBlock);
      // reattach scripts
      newScripts.forEach(function(script) {
        var ns = document.createElement('script');
        for (var att, i = 0, atts = script.attributes, n = atts.length; i < n; i++) {
          att = atts[i];
          ns.setAttribute(att.nodeName, att.nodeValue);
        }
        ns.textContent = script.textContent;
        newBlock.appendChild(ns);
      });
    });

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  self.navigate = function(url, isPushState) {
    self.xhr.abort();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function(xhrEvent) {
      var isContinue = true;
      if (handlers.onLoaded instanceof Function) {
        isContinue = handlers.onLoaded(xhr) !== false;
      }
      if (isContinue) {
        self.replaceBlocks(url, isPushState, xhr.responseText);
        if (handlers.onDone instanceof Function) {
          handlers.onDone(xhr);
        }
        if (handlers.onAlways instanceof Function) {
          handlers.onAlways();
        }
      }
    };

    xhr.onerror = function(xhrEvent) {
      if (handlers.onError instanceof Function) {
        handlers.onError(xhr);
      }
      if (handlers.onAlways instanceof Function) {
        handlers.onAlways();
      }
    };

    xhr.send();
    self.xhr = xhr;
  };

  self.bindLinks = function(linkNodes) {
    Array.prototype.slice.call(linkNodes)
      .filter(function(link) {
        return link.hostname === location.hostname;
      })
      .forEach(function(link) {
        link.onclick = function(clickEvent) {
          clickEvent.preventDefault();
          setTimeout(function() {
            if (handlers.onClick instanceof Function) {
              if (handlers.onClick(clickEvent, link) === false) {
                return;
              }
            }
            self.navigate(link.href, true);
          }, 1);
          return false;
        }
      });
  };



  // Ensure that the history is correct when going from 2nd page to 1st
  history.replaceState({
    'url' : location.href,
    'title' : document.title
  }, document.title, location.href);

  // Only add a class to internal links
  self.bindLinks(document.querySelectorAll(linkSelector));

  // On new page load
  addEventListener('popstate', function(event) {
    if (event.state) {
      self.navigate(event.state.url, false);
    }
  });
};
