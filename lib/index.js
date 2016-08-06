"use strict";

var G = {}
G.pData = null
G.getDataPromise = $.ajax({
  dataType: "json",
  url: './data/pData.json',
  success: data => {
    G.pData = data
    $('#loading-warning').remove()
    // It failed to clear in some cases so do it again 0.8 seconds later
    setTimeout(()=>{$('#loading-warning').remove()}, 800)
  },
  error: (prom, status, code) => {
    console.log('********* FAILED to fetch pdata '+status+', '+code)
  },
});

var dropDownMenus = {}
var debugModeCheckbox = null

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var recomputePane = function(pane) {
  if (!pane.createImmediately) {
    pane.form.find('.results-div').remove()
  }
  var params = []
  var paramsObject = {}
  pane.formSpec.forEach(function(item) {
    var v = null
    var element = pane.form.find('.'+item[1])
    if ('select' === item[0]) {
      v = element.val()
    } else if ('checkbox' === item[0]) {
      v = element.prop('checked') ? 1 : 0
    } else if ('string' === item[0]) {
      v = element.val()
    } else if ('button' === item[0]) {
      // nothing to do
    } else {
      console.log('recomputePane: unknown spec function', pane.formSpec, pane)
    }
    if (v !== null) {
      params.push(v)
      paramsObject[item[1]] = v
    }
  })
  if (pane.html) {
    pane.form.append(pane.html)
  } else if (pane.url === 'totals') {
    if (G.pData) {
      pane.form.append(makeTotalsHTML(params))
    } else {
      G.getDataPromise.done(()=>{
        recomputePane(paneDefinitions[0])
      })
    }
  } else {
    console.log('********** ERROR pane has no action ', pane)
  }
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var addPanesToTabMenu = function() {
  var paneIndex = 1
  paneDefinitions.forEach(function(pane, index) {
    pane.form = null
    pane.paneId = 'pane' + paneIndex
    paneIndex += 1
    pane.link = $('<a href="#' + pane.paneId + '" role="tab">' + pane.title + '</a>')
    .on('click', function() {
      if (!pane.form) {
        pane.form = $(createForm(pane))
        $('#tab-content-div').append(pane.form)
      }
      pane.link.tab('show')
      recomputePane(pane)
    })
    var li = $('<li role="presentation"></li>').append(pane.link)
    $('#topline-tabs').append(li)
    if (pane.createImmediately) pane.link.click()
  })
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var docReady = () => {
  addPanesToTabMenu()
  paneDefinitions[0].link.click()
}

$(docReady);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var createForm = function(pane) {
  var html = ''
  pane.formSpec.forEach(function(item) {
    if ('select' === item[0]) {
      html += makeSelect(item[1], item[2], item[3])
    } else if ('checkbox' === item[0]) {
      html += makeCheckbox(item[1], item[2], item[3])
    } else if ('string' === item[0]) {
      html += makeStringEntry(item[1], item[2], item[3])
    } else if ('button' === item[0]) {
      html += makeGoButton(item[1], item[2])
    } else {
      console.log('createForm: unknown spec function', pane.formSpec, pane)
    }
  })

  var panel = $(makeTabPanel(pane, makeForm(html)))
  pane.form = panel
  pane.formSpec.forEach(function(item) {
    panel.find('.' + item[1]).on('change', function() {
      recomputePane(pane)
    })
  })

  return panel
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeTabPanel = function(pane, paneBody) {
  return '<div role="tabpanel" class="tab-pane active" id="'
  + pane.paneId + '">' + paneBody + '</div>'
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeSelect = function(idBase, label, items) {
  var ret =
  `<span class="form-label">${label}</span>
  <select name="${idBase}" class="${idBase}">`
  items.forEach(function(item) {
    ret += `<option ${item.selected?'selected ':''}value="${item.value}">${item.label}</option>`
  })
  ret += '</select>'
  return ret
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeCheckbox = function(idBase, label, defaultValue) {
  var checked = defaultValue ? 'checked' : ''
  return `
  <div class="col-sm-offset-2 col-sm-10">
  <div class="checkbox">
  <label>
  <input class="${idBase}" type="checkbox" ${defaultValue}>
  ${label}
  </label>
  </div>
  </div>
  `
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeForm = function(formBody) {
  return '<div class="form-div">' + formBody + '</div>'
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeGoButton = function(idBase, label) {
  return `
  <div class="col-sm-offset-2 col-sm-10">
      <button type="button" class="btn btn-primary ${idBase}-button">${label}</button>
  </div>
  `
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeStringEntry = function(idBase, label, placeHolder) {
  return `
  <label class="col-sm-2 control-label" for="${idBase}">${label}</label>
  <div class="col-sm-10">
      <input type="text" class="form-control ${idBase}" id="${idBase}" placeholder="${placeHolder}">
  </div>
  `
};
