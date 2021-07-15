
/**
 * Duplicates the fields for a new row in the fieldmap options screen.
 * this appears not to work with data() instead of attr()
 */
 function addFieldMappingRow( button ) {
	var salesforceObject = $( '#salesforce_object' ).val();
	var wordpressObject = $( '#wordpress_object' ).val();
	var newKey = new Date().getUTCMilliseconds();
	var lastRow = $( 'table.fields tbody tr' ).last();
	var oldKey = lastRow.attr( 'data-key' );
	oldKey = new RegExp( oldKey, 'g' );
	if ( '' !== wordpressObject && '' !== salesforceObject ) {
		fieldmapFields( oldKey, newKey, lastRow );
		button.parent().find( '.missing-object' ).remove();
		button.text( button.data( 'add-more' ) );
	} else {
		button.text( button.data( 'add-first' ) );
		button.parent().prepend( '<div class="error missing-object"><span>' + button.data( 'error-missing-object' ) + '</span></div>' );
	}
	return false;
}

/**
 * Clones the fieldset markup provided by the server-side template and appends it at the end.
 * this appears not to work with data() instead of attr()
 * @param {string} oldKey the data key attribute of the set that is being cloned
 * @param {string} newKey the data key attribute for the one we're appending
 * @param {object} lastRow the last set of the fieldmap
 */
function fieldmapFields( oldKey, newKey, lastRow ) {
	var nextRow = '';
	if ( jQuery.fn.select2 ) {
		nextRow = lastRow.find( 'select' ).select2( 'destroy' ).end().clone( true ).removeClass( 'fieldmap-template' );
	} else {
		nextRow = lastRow.find( 'select' ).end().clone( true ).removeClass( 'fieldmap-template' );
	}
	$( nextRow ).attr( 'data-key', newKey );
	$( nextRow ).each( function() {
		$( this ).html( function( i, h ) {
			return h.replace( oldKey, newKey );
		} );
	} );
	$( 'table.fields tbody' ).append( nextRow );
	if ( jQuery.fn.select2 ) {
		lastRow.find( 'select' ).select2();
		nextRow.find( 'select' ).select2();
	}
}

// load available options if the WordPress object changes
$( document ).on( 'change', '.column-wordpress_field select', function() {
	disableAlreadyMappedFields( 'wordpress' );
} );
// load available options if the Salesforce object changes
$( document ).on( 'change', '.column-salesforce_field select', function() {
	disableAlreadyMappedFields( 'salesforce' );
} );

/**
 * Disable fields that are already mapped from being mapped again.
 * @param {string} system whether we want WordPress or Salesforce data
 */
function disableAlreadyMappedFields( system ) {
	// load the select statements for Salesforce or WordPress.
	var select = $( '.fieldmap-disable-mapped-fields .column-' + system + '_field select' );
	var allSelected = [];
	// add each currently selected value to an array, then make it unique.
	select.each( function( i, fieldChoice ) {
		var selectedValue = $( fieldChoice ).find( 'option:selected' ).val();
		if ( null !== selectedValue && '' !== selectedValue ) {
			allSelected.push( selectedValue );
		}
	});
	allSelected = allSelected.filter((v, i, a) => a.indexOf(v) === i);
	// disable the items that are selected in another select, enable them otherwise.
	$( 'option', select ).removeProp( 'disabled' );
	$( 'option', select ).prop( 'disabled', false );
	$.each( allSelected, function( key, value ) {
		$( 'option[value=' + value + ']', select ).prop( 'disabled', true );
	} );
	// reinitialize select2 if it's active.
	if ( jQuery.fn.select2 ) {
		$( '.column-' + system + '_field select' ).select2();
	}
}

/**
 * Handle click event for the Add another field mapping button.
 * It duplicates the fields for a new row in the fieldmap options screen.
 */
 $( document ).on( 'click', '#add-field-mapping', function() {
	addFieldMappingRow( $( this ) );
} );

/**
 * As the Drupal plugin does, we only allow one field to be a prematch
 */
$( document ).on( 'click', '.column-is_prematch input', function() {
	$( '.column-is_prematch input' ).not( this ).prop( 'checked', false );
} );

/**
 * As the Drupal plugin does, we only allow one field to be a key
 */
$( document ).on( 'click', '.column-is_key input', function() {
	$( '.column-is_key input' ).not( this ).prop( 'checked', false );
} );

/**
 * When the plugin loads:
 * Disable fields that are already selected
 * Select2 on select fields
 */
$( document ).ready( function() {

	// disable the option values for fields that have already been mapped.
	disableAlreadyMappedFields( 'salesforce' );
	disableAlreadyMappedFields( 'wordpress' );

	// setup the select2 fields if the library is present
	if ( jQuery.fn.select2 ) {
		$( 'select#wordpress_object' ).select2();
		$( 'select#salesforce_object' ).select2();
		$( 'select#salesforce_record_type_default' ).select2();
		$( 'select#pull_trigger_field' ).select2();
		$( '.column-wordpress_field select' ).select2();
		$( '.column-salesforce_field select' ).select2();
	}
} );
