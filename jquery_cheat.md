# jQuery Cheatsheet 📋

## **1. jQuery einbinden**
```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

## **2. Grundlagen**
```javascript
$(document).ready(function() {
    // Code wird ausgeführt wenn DOM geladen ist
});

// Kurzform:
$(function() {
    // Dein Code hier
});
```

## **3. Elemente auswählen (Selektoren)**
```javascript
$('#id')              // Element mit ID
$('.class')           // Elemente mit CSS-Klasse
$('tag')              // Alle Tags (div, p, h1, etc.)
$('input[type="text"]') // Input mit Attribut
$('.class1, .class2') // Mehrere Selektoren
$('#parent .child')   // Verschachtelte Elemente
```

## **4. DOM-Manipulation**
```javascript
// Text & HTML
$('#element').text('Neuer Text');
$('#element').html('<b>HTML Content</b>');
$('#element').val('Input Wert');

// CSS & Styling
$('#element').css('color', 'red');
$('#element').addClass('neue-klasse');
$('#element').removeClass('alte-klasse');
$('#element').toggleClass('toggle-klasse');

// Sichtbarkeit
$('#element').show();
$('#element').hide();
$('#element').toggle();
$('#element').fadeIn();
$('#element').fadeOut();

// Attribute
$('#element').attr('src', 'bild.jpg');
$('#element').removeAttr('disabled');
$('#element').prop('checked', true);
```

## **5. Event-Handler**
```javascript
// Klick-Events
$('#button').click(function() {
    alert('Geklickt!');
});

// Weitere Events
$('#input').change(function() { ... });
$('#form').submit(function() { ... });
$('#element').hover(function() { ... });

// Event-Delegation (für dynamische Elemente)
$(document).on('click', '.button', function() {
    // Funktioniert auch für später hinzugefügte Buttons
});

// Event-Objekt verwenden
$('#button').click(function(event) {
    event.preventDefault(); // Standardverhalten verhindern
    console.log(event.target); // Geklicktes Element
});
```

## **6. AJAX-Requests**
```javascript
// GET-Request
$.get('/api/data')
    .done(function(data) {
        console.log('Erfolg:', data);
    })
    .fail(function() {
        console.log('Fehler!');
    });

// POST-Request
$.post('/api/save', {name: 'Max', age: 25})
    .done(function(response) {
        console.log('Gespeichert:', response);
    });

// Erweiterte AJAX
$.ajax({
    url: '/api/endpoint',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({key: 'value'}),
    success: function(data) {
        console.log('Erfolg:', data);
    },
    error: function() {
        console.log('Fehler!');
    }
});
```

## **7. DOM-Traversierung**
```javascript
$('#element').parent();        // Eltern-Element
$('#element').children();      // Direkte Kinder
$('#element').find('.class');  // Suche in Kindern
$('#element').siblings();      // Geschwister-Elemente
$('#element').next();          // Nächstes Element
$('#element').prev();          // Vorheriges Element
```

## **8. Elemente hinzufügen/entfernen**
```javascript
// Hinzufügen
$('#container').append('<div>Am Ende</div>');
$('#container').prepend('<div>Am Anfang</div>');
$('#element').after('<div>Nach Element</div>');
$('#element').before('<div>Vor Element</div>');

// Entfernen
$('#element').remove();        // Element komplett löschen
$('#element').empty();         // Inhalt leeren
$('#element').detach();        // Element entfernen aber Events behalten
```

## **9. Formulare**
```javascript
// Werte auslesen
$('#input').val();             // Input-Wert
$('#checkbox').is(':checked'); // Checkbox Status
$('#select').val();            // Select-Wert

// Formular serialisieren
$('#form').serialize();        // URL-encoded String
$('#form').serializeArray();   // Array von Objekten

// Validation
if ($('#input').val() === '') {
    alert('Feld ist leer!');
}
```

## **10. Nützliche Utility-Funktionen**
```javascript
// Arrays/Objekte durchlaufen
$.each(array, function(index, value) {
    console.log(index + ': ' + value);
});

// Element-Liste durchlaufen
$('.items').each(function(index) {
    console.log('Element ' + index + ':', $(this));
});

// Typ-Checks
$.isArray(variable);
$.isFunction(variable);
$.isEmptyObject(object);

// String-Utilities
$.trim('  text  ');            // Whitespace entfernen
```

## **11. Häufige Patterns**
```javascript
// Loading-Spinner
$('#loading').show();
$.get('/api/data')
    .always(function() {
        $('#loading').hide();
    });

// Toggle-Button
$('#toggle').click(function() {
    $('#content').toggle();
    $(this).text($(this).text() === 'Zeigen' ? 'Verstecken' : 'Zeigen');
});

// Dynamische Listen
function addItem(text) {
    $('#list').append(`<li>${text} <button class="delete">×</button></li>`);
}

$(document).on('click', '.delete', function() {
    $(this).parent().remove();
});
```

## **12. Performance-Tipps**
```javascript
// ❌ Schlecht: Mehrfach selektieren
$('#element').addClass('class1');
$('#element').removeClass('class2');
$('#element').text('Text');

// ✅ Gut: Einmal selektieren, chainable methods
$('#element')
    .addClass('class1')
    .removeClass('class2')
    .text('Text');

// ❌ Schlecht: In Schleife DOM manipulieren
for(let i = 0; i < items.length; i++) {
    $('#list').append('<li>' + items[i] + '</li>');
}

// ✅ Gut: HTML sammeln, dann einmal einfügen
let html = '';
for(let i = 0; i < items.length; i++) {
    html += '<li>' + items[i] + '</li>';
}
$('#list').html(html);
```

## **13. Debugging**
```javascript
// Element existiert?
if ($('#element').length > 0) {
    console.log('Element gefunden');
}

// Event-Handler testen
$('#button').off('click').on('click', function() {
    console.log('Click funktioniert!');
});
```

**💡 Tipp:** jQuery-Methoden sind "chainable" - du kannst sie aneinanderhängen:
```javascript
$('#element').hide().removeClass('old').addClass('new').fadeIn();
```

Das sollte dir einen guten Start mit jQuery geben! 🚀