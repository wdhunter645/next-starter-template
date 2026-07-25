/*
 * OpenSeadragon - Point
 *
 * Copyright (C) 2009 CodePlex Foundation
 * Copyright (C) 2010-2025 OpenSeadragon contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * - Neither the name of CodePlex Foundation nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function( $ ){

$.Point = function( x, y ) {
    this.x = typeof ( x ) === "number" ? x : 0;
    this.y = typeof ( y ) === "number" ? y : 0;
};

$.Point.prototype = {
    clone: function() {
        return new $.Point(this.x, this.y);
    },

    plus: function( point ) {
        return new $.Point(
            this.x + point.x,
            this.y + point.y
        );
    },

    minus: function( point ) {
        return new $.Point(
            this.x - point.x,
            this.y - point.y
        );
    },

    times: function( factor ) {
        return new $.Point(
            this.x * factor,
            this.y * factor
        );
    },

    divide: function( factor ) {
        return new $.Point(
            this.x / factor,
            this.y / factor
        );
    },

    negate: function() {
        return new $.Point( -this.x, -this.y );
    },

    distanceTo: function( point ) {
        return Math.sqrt(
            Math.pow( this.x - point.x, 2 ) +
            Math.pow( this.y - point.y, 2 )
        );
    },

    squaredDistanceTo: function( point ) {
        return Math.pow( this.x - point.x, 2 ) +
            Math.pow( this.y - point.y, 2 );
    },

    apply: function( func ) {
        return new $.Point( func( this.x ), func( this.y ) );
    },

    equals: function( point ) {
        return (
            point instanceof $.Point
        ) && (
            this.x === point.x
        ) && (
            this.y === point.y
        );
    },

    rotate: function (degrees, pivot) {
        pivot = pivot || new $.Point(0, 0);
        let cos;
        let sin;
        if (degrees % 90 === 0) {
            const d = $.positiveModulo(degrees, 360);
            switch (d) {
                case 0:
                    cos = 1;
                    sin = 0;
                    break;
                case 90:
                    cos = 0;
                    sin = 1;
                    break;
                case 180:
                    cos = -1;
                    sin = 0;
                    break;
                case 270:
                    cos = 0;
                    sin = -1;
                    break;
            }
        } else {
            const angle = degrees * Math.PI / 180.0;
            cos = Math.cos(angle);
            sin = Math.sin(angle);
        }
        const x = cos * (this.x - pivot.x) - sin * (this.y - pivot.y) + pivot.x;
        const y = sin * (this.x - pivot.x) + cos * (this.y - pivot.y) + pivot.y;
        return new $.Point(x, y);
    },

    toString: function() {
        return "(" + (Math.round(this.x * 100) / 100) + "," + (Math.round(this.y * 100) / 100) + ")";
    }
};

}( OpenSeadragon ));
