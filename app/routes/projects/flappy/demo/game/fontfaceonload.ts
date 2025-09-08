interface FontFaceOnloadOptions {
	tolerance: number;
	delay: number;
	glyphs: string;
	success: () => void;
	error: () => void;
	timeout: number;
	weight: string;
	style: string;
}

interface FontFaceOnloadMeasurements {
	width: number;
	height: number;
	sansSerif: {
		width: number;
		height: number;
	};
	serif: {
		width: number;
		height: number;
	};
}

const TEST_STRING = 'AxmTYklsjo190QW';
const SANS_SERIF_FONTS = 'sans-serif';
const SERIF_FONTS = 'serif';

const defaultOptions: FontFaceOnloadOptions = {
	tolerance: 2, // px
	delay: 100,
	glyphs: '',
	success: function() {},
	error: function() {},
	timeout: 5000,
	weight: '400', // normal
	style: 'normal'
};

// See https://github.com/typekit/webfontloader/blob/master/src/core/fontruler.js#L41
const style = [
	'display:block',
	'position:absolute',
	'top:-999px',
	'left:-999px',
	'font-size:48px',
	'width:auto',
	'height:auto',
	'line-height:normal',
	'margin:0',
	'padding:0',
	'font-variant:normal',
	'white-space:nowrap'
];
const html = '<div style="%s">' + TEST_STRING + '</div>';

class FontFaceOnloadInstance {
	fontFamily: string;
	appended: boolean;
	serif: HTMLElement | undefined;
	sansSerif: HTMLElement | undefined;
	parent: HTMLElement | undefined;
	options: FontFaceOnloadOptions;

	constructor() {
		this.fontFamily = '';
		this.appended = false;
		this.serif = undefined;
		this.sansSerif = undefined;
		this.parent = undefined;
		this.options = {} as FontFaceOnloadOptions;
	}

	getMeasurements(): FontFaceOnloadMeasurements {
		return {
			sansSerif: {
				width: this.sansSerif!.offsetWidth,
				height: this.sansSerif!.offsetHeight
			},
			serif: {
				width: this.serif!.offsetWidth,
				height: this.serif!.offsetHeight
			}
		};
	}

	load(): void {
		const startTime = new Date();
		const that = this;
		let serif = that.serif;
		let sansSerif = that.sansSerif;
		let parent = that.parent;
		let appended = that.appended;
		let dimensions: FontFaceOnloadMeasurements | undefined;
		const options = that.options;
		let ref = (options as any).reference;

		function getStyle(family: string): string {
			return style
				.concat(['font-weight:' + options.weight, 'font-style:' + options.style])
				.concat("font-family:" + family)
				.join(";");
		}

		const sansSerifHtml = html.replace(/\%s/, getStyle(SANS_SERIF_FONTS));
		const serifHtml = html.replace(/\%s/, getStyle(SERIF_FONTS));

		if (!parent) {
			parent = that.parent = document.createElement("div");
		}

		parent.innerHTML = sansSerifHtml + serifHtml;
		sansSerif = that.sansSerif = parent.firstChild as HTMLElement;
		serif = that.serif = sansSerif.nextSibling as HTMLElement;

		if (options.glyphs) {
			sansSerif.innerHTML += options.glyphs;
			serif.innerHTML += options.glyphs;
		}

		function hasNewDimensions(dims: FontFaceOnloadMeasurements, el: HTMLElement, tolerance: number): boolean {
			return Math.abs(dims.width - el.offsetWidth) > tolerance ||
				Math.abs(dims.height - el.offsetHeight) > tolerance;
		}

		function isTimeout(): boolean {
			return (new Date()).getTime() - startTime.getTime() > options.timeout;
		}

		(function checkDimensions() {
			if (!ref) {
				ref = document.body;
			}
			if (!appended && ref) {
				ref.appendChild(parent!);
				appended = that.appended = true;

				dimensions = that.getMeasurements();

				// Make sure we set the new font-family after we take our initial dimensions:
				// handles the case where FontFaceOnload is called after the font has already
				// loaded.
				sansSerif!.style.fontFamily = that.fontFamily + ', ' + SANS_SERIF_FONTS;
				serif!.style.fontFamily = that.fontFamily + ', ' + SERIF_FONTS;
			}

			if (appended && dimensions &&
				(hasNewDimensions(dimensions.sansSerif, sansSerif!, options.tolerance) ||
					hasNewDimensions(dimensions.serif, serif!, options.tolerance))) {

				options.success();
			} else if (isTimeout()) {
				options.error();
			} else {
				if (!appended && "requestAnimationFrame" in window) {
					window.requestAnimationFrame(checkDimensions);
				} else {
					window.setTimeout(checkDimensions, options.delay);
				}
			}
		})();
	} // end load()

	cleanFamilyName(family: string): string {
		return family.replace(/[\'\"]/g, '').toLowerCase();
	}

	cleanWeight(weight: string): string {
		// lighter and bolder not supported
		const weightLookup: { [key: string]: string } = {
			normal: '400',
			bold: '700'
		};

		return '' + (weightLookup[weight] || weight);
	}

	checkFontFaces(timeout: number | undefined): void {
		const _t = this;
		document.fonts.forEach(function(font: FontFace) {
			if (_t.cleanFamilyName(font.family) === _t.cleanFamilyName(_t.fontFamily) &&
				_t.cleanWeight(font.weight) === _t.cleanWeight(_t.options.weight) &&
				font.style === _t.options.style) {
				font.load().then(function() {
					_t.options.success();
					if (timeout) {
						window.clearTimeout(timeout);
					}
				});
			}
		});
	}

	init(fontFamily: string, options: Partial<FontFaceOnloadOptions>): void {
		let timeout: number | undefined;

		for (const j in defaultOptions) {
			if (!options.hasOwnProperty(j)) {
				(options as any)[j] = defaultOptions[j as keyof FontFaceOnloadOptions];
			}
		}

		this.options = options as FontFaceOnloadOptions;
		this.fontFamily = fontFamily;

		// For some reason this was failing on afontgarde + icon fonts.
		if (!options.glyphs && "fonts" in document) {
			if (options.timeout) {
				timeout = window.setTimeout(function() {
					options.error!();
				}, options.timeout);
			}

			this.checkFontFaces(timeout);
		} else {
			this.load();
		}
	}
}

function FontFaceOnload(fontFamily: string, options: Partial<FontFaceOnloadOptions>): FontFaceOnloadInstance {
	const instance = new FontFaceOnloadInstance();
	instance.init(fontFamily, options);

	return instance;
}

// intentional global
(window as any).FontFaceOnload = FontFaceOnload;