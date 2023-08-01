import fuzzy from 'fuzzy'
import merge from 'merge'

const toggleAllProperties = (state, payload, update, toggleType, suiteTesttoggleType) => {
  update[toggleType] = state[toggleType]
  update[toggleType][payload.type] = payload.active

  if (payload.type === 'all') {
    update[toggleType].suites = payload.active
    update[toggleType].tests = payload.active
  }

  if (payload.type === 'all' || payload.type === 'suites') {
    Object.values(update.currentSuites).forEach(suite => {
      suite.properties[suiteTesttoggleType] = payload.active
    })
  }

  if (payload.type === 'all' || payload.type === 'tests') {
    Object.values(update.currentSuites).forEach(suite => {
      Object.values(suite.tests).forEach(test => {
        if ('properties' in test) {
          test.properties[suiteTesttoggleType] = payload.active
        }
      })
    })
  }
  return update
}

export default (state, { type, payload }) => {
  let update = {}
  update.currentSuites = state.currentSuites

  if (type === 'parse-error') {
    state = merge.recursive(true, {}, state)
    state.errors = state.errors || []
    state.errors.push({
      error: payload.error,
      file: payload.file
    })
  }

  if (type === 'parse-suites') {
    state = merge.recursive(true, {}, state)
    state.suites = payload.suites
    state.currentSuites = payload.suites
    Object.values(state.currentSuites).forEach(suite => {
      if (Object.keys(suite.tests).length > 0 || Object.keys(suite.properties).length > 0) suite.active = true
    })
  }

  if (type === 'search-suites') {
    Object.values(state.suites).forEach(({ name, id }) => {
      if (fuzzy.test(payload.value.toLowerCase(), name.toLowerCase())) {
        update.currentSuites[id] = update.currentSuites[id] || merge.recursive(true, {}, state.suites[id])
        if (!('active' in update.currentSuites[id])) update.currentSuites[id].active = true
      } else delete update.currentSuites[id]
    })
    update.suitesExpanded = Object.values(update.currentSuites).some(suite => suite.active === true)
  }
  if (type === 'search-tests') {
    Object.values(state.suites).forEach(suite => {
      Object.values(suite.tests).forEach(test => {
        if (!fuzzy.test(payload.value.toLowerCase(), test.name.toLowerCase()) && !test.messages.some(message => fuzzy.test(payload.value.toLowerCase(), message.toLowerCase()))) {
          if (update.currentSuites[suite.id]) delete update.currentSuites[suite.id].tests[test.id]
        } else if (suite.id in update.currentSuites && !(test.id in update.currentSuites[suite.id].tests)) {
          if (update.currentSuites[suite.id]) {
            update.currentSuites[suite.id].tests[test.id] = merge.recursive(true, {}, state.suites[suite.id].tests[test.id])
            update.currentSuites[suite.id].tests[test.id].active = true
            update.currentSuites[suite.id].tests[test.id].visible = true
            update.currentSuites[suite.id].tests[test.id].raw = true
          }
        }
      })
    })
  }
  if (type === 'search-properties') {
    Object.values(state.suites).forEach(suite => {
      Object.entries(suite.properties)
        .filter(([key]) => key !== '_visible' && key !== '_active')
        .forEach(([key, values]) => {
          values = values || []
          if (!fuzzy.test(payload.value.toLowerCase(), key.toLowerCase()) && !values.some(value => fuzzy.test(payload.value.toLowerCase(), value.toLowerCase()))) delete update.currentSuites[suite.id].properties[key]
          else if (suite.id in update.currentSuites && !(key in update.currentSuites[suite.id].properties)) {
            if (update.currentSuites[suite.id]) {
              update.currentSuites[suite.id].properties[key] = [].concat(state.suites[suite.id].properties[key])
              update.currentSuites[suite.id].properties._active = true
              update.currentSuites[suite.id].properties._visible = true
              update.propertiesExpanded = false
            }
          }
        })
    })
    update.propertiesExpanded = Object.values(update.currentSuites).some((suite) => {
      return suite.properties._active || false
    })
    update.propertiesVisible = Object.values(update.currentSuites).some((suite) => {
      return suite.properties._visible || false
    })
  }

  if (type === 'toggle-all-suites') {
    update.suitesExpanded = !state.suitesExpanded
    Object.values(update.currentSuites).forEach(suite => { suite.active = update.suitesExpanded })
  }
  if (type === 'toggle-empty-suites') {
    update.suitesEmpty = !state.suitesEmpty
  }
  if (type === 'toggle-menu') update.menuActive = !state.menuActive
  if (type === 'toggle-suite-options') update.suiteOptionsActive = !state.suiteOptionsActive
  if (type === 'toggle-test-options') update.testOptionsActive = !state.testOptionsActive
  if (type === 'toggle-properties-options') update.propertiesOptionsActive = !state.propertiesOptionsActive
  if (type === 'toggle-files') update.activeFiles = !state.activeFiles
  if (type === 'toggle-suite') {
    update.currentSuites[payload.id].active = payload.active
    update.suitesExpanded = Object.values(update.currentSuites).some(suite => suite.active === true)
  }

  if (type === 'toggle-properties') {
    if (typeof payload.test !== 'undefined' && payload.test !== null) {
      update.currentSuites[payload.suite].tests[payload.test].properties._active = payload.active
    } else {
      update.currentSuites[payload.suite].properties._active = payload.active
      update.propertiesExpanded = Object.values(update.currentSuites).some((suite) => {
        return suite.properties._active || false
      })
    }
  }

  if (type === 'toggle-all-properties') {
    update = toggleAllProperties(state, payload, update, 'propertiesExpanded', '_active')
  }
  if (type === 'toggle-properties-visbility') {
    update = toggleAllProperties(state, payload, update, 'propertiesVisible', '_visible')
  }

  if (type === 'toggle-test') {
    update.currentSuites[payload.suite].tests[payload.id].active = payload.active
  }
  if (type === 'toggle-test-mode') {
    update.currentSuites[payload.suite].tests[payload.id].raw = payload.raw
  }

  if (type === 'toggle-test-expanded') {
    update.testToggles = state.testToggles
    update.testToggles[payload.status].expanded = payload.active

    Object.values(update.currentSuites).forEach(suite => {
      Object.values(suite.tests).forEach(test => {
        if (payload.status === 'all') test.active = payload.active
        else if (payload.status === test.status) test.active = payload.active
        else if (typeof test.status === 'undefined' && payload.status === 'unknown') test.active = payload.active
      })
    })

    if (payload.status === 'all') {
      update.testToggles.passed.expanded = payload.active
      update.testToggles.failure.expanded = payload.active
      update.testToggles.error.expanded = payload.active
      update.testToggles.skipped.expanded = payload.active
      update.testToggles.unknown.expanded = payload.active
    } else {
      if (update.testToggles.passed.expanded &&
            update.testToggles.failure.expanded &&
            update.testToggles.error.expanded &&
            update.testToggles.skipped.expanded &&
            update.testToggles.unknown.expanded) update.testToggles.all.expanded = true
      else update.testToggles.all.expanded = false
    }
  }

  if (type === 'toggle-test-raw') {
    update.testToggles = state.testToggles
    update.testToggles[payload.status].raw = payload.active

    Object.values(update.currentSuites).forEach(suite => {
      Object.values(suite.tests).forEach(test => {
        if (payload.status === 'all') test.raw = payload.active
        else if (payload.status === test.status) test.raw = payload.active
        else if (typeof test.status === 'undefined' && payload.status === 'unknown') test.raw = payload.active
      })
    })

    if (payload.status === 'all') {
      update.testToggles.passed.raw = payload.active
      update.testToggles.failure.raw = payload.active
      update.testToggles.error.raw = payload.active
      update.testToggles.skipped.raw = payload.active
      update.testToggles.unknown.raw = payload.active
    } else {
      if (update.testToggles.passed.raw &&
            update.testToggles.failure.raw &&
            update.testToggles.error.raw &&
            update.testToggles.skipped.raw &&
            update.testToggles.unknown.raw) update.testToggles.all.raw = true
    }
  }

  if (type === 'hero-burger') {
    const { burger } = state.hero
    update.hero = update.hero || {}
    update.hero.burger = !burger
  }

  if (type === 'hero-dropdown') {
    const { dropdown } = state.hero
    update.hero = update.hero || {}
    update.hero.dropdown = !dropdown
  }

  if (type === 'hero-print-mode') {
    const { printMode } = state
    update.printMode = !printMode
  }

  if (type === 'print-mode') {
    update.printMode = payload.printMode
  }

  state = merge.recursive(true, state, update)

  state = merge.recursive(true, state, update)

  Object.values(state.currentSuites).forEach(suite => {
    if (!state.suitesEmpty) suite._visible = true
    else suite._visible = (Object.keys(suite.tests).length > 0 && Object.values(suite.tests).filter(test => test.visible).length > 0) || (suite.properties._visible && Object.keys(suite.properties).filter(prop => prop !== '_visible').length > 0)
  })

  return state
}
