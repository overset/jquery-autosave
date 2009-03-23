/*
**	autoSave jQuery plugin - automatically save a js object to a server-side script
**		0.3 autoSave array of objects
**		0.2 addition of callback function upon successful server-side save
**		0.1 initial release + simple json serialization compare on interval and jQuery POST when the object changes
**	authored by Jim Palmer - released under MIT license
**  CONFIG -- place in your document.ready function two possible config settings:
**    $.autoSave.object = {'obj1':'/handler.php',..}; // REQUIRED - object of object:saver pairs - object names must work with eval()
**  jquery.json.js plugin required
*/
(function($) {
	// setup the interval function as singleton via document.ready.
	$(function () { 
		$.autoSave.intervalId = $.autoSave.intervalId || window.setInterval( function () { if (typeof $.autoSave == 'function') $.autoSave( $.autoSave.callback ); }, 800 );
	});
	$.autoSave = function ( callback ) {
		// the jquery.json.js plugin must be included && autosave object must be initialized
		if ( typeof($.toJSON) != 'function' || typeof $.autoSave.object == 'undefined' ) return false;
		$.autoSave._oldObjString = $.autoSave._oldObjString || {};
		$.autoSave.saving = $.autoSave.saving || {};
		// loop through each autoSave obj, detect changes and save if so - through closures of $.each()
		$.each($.autoSave.object, function (obj, handler) {
			// only if the object has changed value in any way - this is a semi-expensive operation
			if ( $.toJSON( eval( obj ) ) != $.autoSave._oldObjString[ obj ] && !$.autoSave.saving[ obj ] )
				// formulate a simple POST with the JSON serialized data to save in the session
				$.ajax({data: 'saveObject=' + escape( $.toJSON( eval( obj ) ) ),
					type: 'POST',
					beforeSend: function () { $.autoSave.saving[ obj ] = true; },
					success: function () { 
						$.autoSave._oldObjString[ obj ] = $.toJSON( eval( obj ) ); 
						if ( typeof callback == 'function' ) 
							callback( eval( obj ) );
						$.autoSave.saving[ obj ] = false;
					},
					url: handler,
					error: function () { $.autoSave.intervalId = window.clearInterval( $.autoSave.intervalId ); } });
		});
	}
})(jQuery);