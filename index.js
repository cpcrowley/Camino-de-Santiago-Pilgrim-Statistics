"use strict";
var dropDownMenus = {}
var debugModeCheckbox = null

var paneDefinitions = [
  {
    paneTitle: '',
    category: '',
    categoryPrefix: '',
    title: 'Pilgrim counts',
    url: 'totals',
    formSpec: [
      ['select', 'by-what', 'Breakdown by', [
        {label:'Age of pilgrims', value:'by-age', selected:true},
        {label:'Month they completed the Camino', value:'by-month', selected:false},
        {label:'Gender of pilgrims', value:'by-gender', selected:false},
        {label:'Country of origin', value:'by-country', selected:false},
        {label:'Which Camino they traveled', value:'by-camino', selected:false},
        {label:'Where they started', value:'by-starting-point', selected:false},
        {label:'Method of transport', value:'by-transport', selected:false},
        {label:'Reason for pilgramage', value:'by-reason', selected:false},
        {label:'Profession of pilgrims', value:'by-profession', selected:false},
        {label:'Spanish pilgrims by region', value:'spanish-by-region', selected:false},
      ]],
      ['select', 'max-columns', 'Maximum number of columns to show', [
        {label:'15', value:'15', selected:true},
        {label:'25', value:'25', selected:false},
        {label:'35', value:'35', selected:false},
        {label:'50', value:'50', selected:false},
        {label:'All columns', value:'9999', selected:false},
      ]],
      ['checkbox', 'debug-mode',
      'Debug mode: do NOT check this. It will cause the app to stop working.',
      false],
    ]
  },
  {
    paneTitle: '',
    category: '',
    categoryPrefix: '',
    title: 'Notes',
    url: 'notes',
    formSpec: [],
  },
  {
    paneTitle: '',
    category: '',
    categoryPrefix: '',
    title: 'About',
    url: 'about',
    formSpec: [],
  },
]

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
  if (pane.url) {
    var host = 'http://thechar.com'
    if (!debugModeCheckbox) {
      debugModeCheckbox = $('.debug-mode')
    }
    if (debugModeCheckbox[0].checked) {
      host = 'http://rimac.local'
    }
    $.get(host + ':3867/' + pane.url, paramsObject, function (serverHtml){
      pane.form.append(serverHtml)
    });
  } else {
    questionsRecompute(pane, params)
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
    if (pane.category) {
      // Put it in a tab dropdown menu
      var dropDownTab = dropDownMenus[pane.category]
      var li
      if (!dropDownTab) {
        dropDownTab = $(`<li role="presentation" class="dropdown">
          <a data-target="#" id="${pane.categoryPrefix}" class="dropdown-toggle"
            data-toggle="dropdown" aria-controls="${pane.categoryPrefix}-contents"
            aria-expanded="false">${pane.category}<span class="caret"></span></a>
          <ul class="dropdown-menu" aria-labelledby="${pane.categoryPrefix}"
            id="${pane.categoryPrefix}-contents"></ul></li>`)
        dropDownMenus[pane.category] = dropDownTab
        $('#topline-tabs').append(dropDownTab)
      }
      pane.link = $('<a href="#' + pane.paneId + '" role="tab">' + pane.title + '</a>')
      .on('click', function() {
        if (!pane.form) {
          pane.form = $(createForm(pane))
          $('#tab-content-div').append(pane.form)
          if (pane.createImmediately) recomputePane(pane)
        }
        pane.link.tab('show')
        if (!pane.createImmediately) recomputePane(pane)
      })
      li = $('<li></li>').append(pane.link)
      dropDownTab.find('ul').append(li)

      var qlink = $('<a href="#">' + pane.title + '</a>')
      qlink.on('click', function() {
        pane.link.click()
      })
      var li = $('<li></li>').append(qlink)
      var ql = $('#questions-list').append(li)

    } else {
      pane.link = $('<a href="#' + pane.paneId + '" role="tab">' + pane.title + '</a>')
      .on('click', function() {
        if (!pane.form) {
          pane.form = $(createForm(pane))
          $('#tab-content-div').append(pane.form)
        }
        pane.link.tab('show')
        recomputePane(pane)
      })
      li = $('<li role="presentation"></li>').append(pane.link)
      $('#topline-tabs').append(li)
      if (pane.createImmediately) pane.link.click()
    }
  })
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var initCallbacks = function() {
  addPanesToTabMenu()
  paneDefinitions[0].link.click()
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
$(initCallbacks);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var questionsRecomputeOnce = false

var questionsRecompute = function(pane, params) {
  if (questionsRecomputeOnce) return
  questionsRecomputeOnce = true;
  var html = `
  <div class="results-div">
  <h4>Questions</h4>
  <ul id="questions-list"></ul>
  </div>
  `
  pane.form.append(html)
}

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
  + pane.paneId + '">' + '<h4>' + pane.paneTitle + '</h4>' + paneBody + '</div>'
};




//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeSelect = function(idBase, label, items) {
  var ret = `<label class="col-sm-2 control-label" for="${idBase}">${label}</label>
  <div class="col-sm-10">
  <select name="${idBase}" class="${idBase} form-control">`
  items.forEach(function(item) {
    ret += `<option ${item.selected?'selected ':''}value="${item.value}">${item.label}</option>`
  })
  ret += '</select></div>'
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
  return '<form class="form-inline" role="form">'
  + '<div class="form-group">' + formBody + '</div></form>'
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
