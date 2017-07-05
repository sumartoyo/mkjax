/*
* jQuery mkjax
*
* @version v0.1
* Released under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* Homepage:
*   https://github.com/sumartoyo/mkjax
*
* mkjax is a modification of djax
* djax Copyright 2012, Brian Zeligson
* Homepage:
*   http://beezee.github.com/mkjax.html
*
*/

(function($, exports) {
	'use strict';

	$.fn.mkjax = function(linkSelector, blockSelector, exceptions, replaceBlockWithFunc) {
		// If browser doesn't support pushState, abort now
		if (!history.pushState) {
			return $(this);
		}

		var self = this,
		    excludes = (exceptions && exceptions.length) ? exceptions : [],
		    replaceBlockWith = (replaceBlockWithFunc) ? replaceBlockWithFunc : $.fn.replaceWith,
		    xhr = $.noop,
				mkjaxing = false;

		// Ensure that the history is correct when going from 2nd page to 1st
		window.history.replaceState({
			'url' : window.location.href,
			'title' : $('title').text()
		}, $('title').text(), window.location.href);

		self.clearMkjaxing = function() {
			self.mkjaxing = false;
		}

		// Exclude the link exceptions
		self.attachClick = function(element, event) {
			var link = $(element),
					exception = false;

			$.each(excludes, function(index, exclusion) {
				if (link.attr('href').indexOf(exclusion) !== -1) {
					exception = true;
				}
				if (window.location.href.indexOf(exclusion) !== -1) {
					exception = true;
				}
			});

			// If the link is one of the exceptions, return early so that
			// the link can be clicked and a full page load as normal
			if (exception) {
				return $(element);
			}

			// From this point on, we handle the behaviour
			event.preventDefault();

			// If we're already doing mkjaxing, return now and silently fail
			if (self.mkjaxing) {
				setTimeout(self.clearMkjaxing, 1000);
				return $(element);
			}

			$(window).trigger('mkjax:click', [element]);
			self.reqUrl = link.attr('href');
			self.triggered = false;
			self.navigate(link.attr('href'), true);
		};

		// Handle the navigation
		self.navigate = function(url, add) {
			var blocks = $(blockSelector);
			self.mkjaxing = true;

			// Get the new page
			$(window).trigger('mkjax:loading', [{
				'url' : url
			}]);

			var replaceBlocks = function(response) {
				if (url !== self.reqUrl) {
					self.navigate(self.reqUrl, false);
					return true;
				}

				var bodyMatches = /<body[^>]*>([\s\S.]*)<\/body>/i.exec(response);
				if (!(bodyMatches)) {
					doFail(response);
					return false;
				}

				// get title
				var title;
				var headMatches = /<head[^>]*>([\s\S.]*)<\/head>/i.exec(response);
				if (headMatches) {
					var headEl = document.createElement('head');
					headEl.innerHTML = headMatches[1];
					var titleEl = headEl.querySelector('title');
					if (titleEl) {
						title = titleEl.textContent.trim();
					}
				}
				title = title || document.title;

				if (add) {
					window.history.pushState({
						'url' : url,
						'title' : title
					}, title, url);
				}

				// Set page title as new page title
				$('title').text(title);

				var bodyEl = document.createElement('body');
				bodyEl.innerHTML = bodyMatches[1];
				var newBlocks = bodyEl.querySelectorAll(blockSelector);
				newBlocks.forEach(function(newBlock) {
					var id = newBlock.getAttribute('id');
			    if (!(id)) return;

					var $oldBlock = $('#'+id);
		    	if (!($oldBlock.length)) return;

		    	var newScripts = newBlock.querySelectorAll('script');
		    	// detach scripts
		    	newScripts.forEach(function(script) {
		    		script.parentNode.removeChild(script);
		    	});

		    	var $newBlock = $(newBlock);
		    	// attach click listener
					$(linkSelector, $newBlock).filter(function () {
						return this.hostname === location.hostname;
					}).addClass('mkJAX_internal').on('click', function (event) {
						return self.attachClick(this, event);
					});

					if ($oldBlock.html() !== $newBlock.html()) {
						// replace with new
						replaceBlockWith.call($oldBlock, $newBlock);
						// reattach scripts
						newScripts.forEach(function(script) {
							$newBlock.append(script);
						});
					}
				});

				// Trigger mkjaxLoad event as a pseudo ready()
				if (!self.triggered) {
					self.triggered = true;
					self.mkjaxing = false;
				}

				doDone(title, response);
			};

			var doDone = function(title, html) {
				$(window).trigger('mkjax:done', [{
					'url' : url,
					'title' : title,
					'html' : html
				}]);
			};

			var doFail = function(html) {
				$(window).trigger('mkjax:fail', [{
					'url' : url,
					'html' : html
				}]);
			};

			var doAlways = function(html) {
				$(window).trigger('mkjax:always', [{
					'url' : url,
					'html' : html
				}]);
			};

			'abort' in xhr && xhr.abort();
			xhr = $.get(url, function(response) {
				replaceBlocks(response);
			}).fail(function(response) {
				doFail(response['responseText']);
			}).always(function(response) {
				doAlways(response['responseText']);
			});
		}; /* End self.navigate */

		// Only add a class to internal links
		$(this).find(linkSelector).filter(function() {
			return this.hostname === location.hostname;
		}).addClass('mkJAX_internal').on('click', function(event) {
			return self.attachClick(this, event);
		});

		// On new page load
		$(window).bind('popstate', function(event) {
			self.triggered = false;
			if (event.originalEvent.state) {
				self.reqUrl = event.originalEvent.state.url;
				self.navigate(event.originalEvent.state.url, false);
			}
		});
	};
}(jQuery, window));
