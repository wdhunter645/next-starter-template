/*	Events
	adds custom events functionality to TL classes
================================================== */

import { mergeData, trace } from "../core/Util"
import TLError from "../core/TLError"

export default class Events {
  on(type, fn, context) {
    if (!fn) throw new TLError("No callback function provided")
    const events = this._tl_events = this._tl_events || {}
    events[type] = events[type] || []
    events[type].push({ action: fn, context: context || this })
    return this
  }

  addEventListener(type, fn, context) { return this.on(type, fn, context) }
  hasEventListeners(type) {
    return ('_tl_events' in this) && (type in this._tl_events) && this._tl_events[type].length > 0
  }
  removeEventListener(type, fn, context) {
    if (!this.hasEventListeners(type)) return this
    for (let i = 0; i < this._tl_events[type].length; i += 1) {
      const event = this._tl_events[type][i]
      if (event.action === fn && (!context || event.context === context)) {
        this._tl_events[type].splice(i, 1)
        return this
      }
    }
    return this
  }
  off(type, fn, context) { return this.removeEventListener(type, fn, context) }
  fire(type, data) {
    if (!this.hasEventListeners(type)) return this
    const event = mergeData({ type, target: this }, data)
    for (const listener of this._tl_events[type].slice()) {
      if (listener.action) listener.action.call(listener.context || this, event)
      else trace(`no action defined for ${type} listener`)
    }
    return this
  }
}
