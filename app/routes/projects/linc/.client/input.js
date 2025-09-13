/*
 * Copyright Callum Tolley and Michael Peran Truscott
 */

var exports = {};
window.addEventListener('load', function() {
    exports.dismiss = dismiss;
    exports.onchange = onchange;
    
    var interestObjects = JSON.parse(document.querySelector('meta[name="interests"]').getAttribute('content'));
    var interests = [];
    var interestNameMap = {};
    for (var i = 0; i < interestObjects.length; i++) {
        var obj = interestObjects[i];
        interests.push(String(obj.id));
        interestNameMap[String(obj.id)] = obj.name;
    }
    
    // Populate the lists, but each without the option selected by
    // the previous one
    
    var nullInterest = '';
    var nullInterestValue = '---------';
    interestNameMap[nullInterest] = nullInterestValue;
    
    var otherOpts = [nullInterest].concat(interests);
    
    var defaultOpts = [
        interests.slice(),
        otherOpts.slice(),
        otherOpts.slice(),
    ];
    
    var currentOpts = [];
    resetCurrentOpts();
    
    var selects = [];
    for (var i = 0; i < currentOpts.length; i++) {
        selects.push(document.getElementById('id_interest' + (i + 1)));
        selects[i].onchange = function() { onchange(i) };
    }
    
    resetSelects();
    
    onchange(0);
    
    function onchange(changedIndex) {
        var selectedValues = [];
        for (var i = 0; i < selects.length; i++) {
            selectedValues.push(selects[i].options[selects[i].selectedIndex].value);
        }
        
        resetCurrentOpts();
        
        // Remove newly selected value from other selects
        removeSelectedValue(changedIndex);
        
        // Then remove other selects' selected values
        for (var i = 0; i < currentOpts.length; i++) {
            if (i !== changedIndex)
                removeSelectedValue(i);
        }
        
        function removeSelectedValue(index) {
            var newlySelectedValue = selectedValues[index];
            if (newlySelectedValue !== nullInterest) {
                for (var i = 0; i < currentOpts.length; i++) {
                    if (i == index)
                        continue;
                    
                    var j = currentOpts[i].indexOf(newlySelectedValue);
                    if (j !== -1)
                        currentOpts[i].splice(j, 1);
                }
            }
        }
        
        resetSelects();
    }
    
    function escapeHTML(s) {
        s = String(s);
        return s.replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    }
    
    function resetSelects() {
        for (var i = 0; i < selects.length; i++) {
            var select = selects[i];
            var selValue = select.value;
            var s = '';
            for (var j = 0; j < currentOpts[i].length; j++) {
                var opt = currentOpts[i][j];
                s += '<option value="' + escapeHTML(opt) + '">' + escapeHTML(interestNameMap[opt]) + '</option>';
            }
            select.innerHTML = s;
            for (var j = 0; j < select.options.length; j++) {
                if (select.options[j].value == selValue) {
                    select.selectedIndex = j;
                    break;
                }
            }
        }
    }
    
    function resetCurrentOpts() {
        currentOpts = [];
        for (var i = 0; i < defaultOpts.length; i++) {
            currentOpts.push(defaultOpts[i].slice());
        }
    }
        
    function dismiss() {
        document.getElementById('messagebar').style.display = 'none';
    }
});