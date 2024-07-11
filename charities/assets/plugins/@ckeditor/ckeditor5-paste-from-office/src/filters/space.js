/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module paste-from-office/filters/space
 */
/**
 * Replaces last space preceding elements closing tag with `&nbsp;`. Such operation prevents spaces from being removed
 * during further DOM/View processing (see especially {@link module:engine/view/domconverter~DomConverter#_processDomInlineNodes}).
 * This method also takes into account Word specific `<o:p></o:p>` empty tags.
 * Additionally multiline sequences of spaces and new lines between tags are removed (see #39 and #40).
 *
 * @param htmlString HTML string in which spacing should be normalized.
 * @returns Input HTML with spaces normalized.
 */
export function normalizeSpacing(htmlString) {
    // Run normalizeSafariSpaceSpans() two times to cover nested spans.
    return normalizeSafariSpaceSpans(normalizeSafariSpaceSpans(htmlString))
        // Remove all \r\n from "spacerun spans" so the last replace line doesn't strip all whitespaces.
        .replace(/(<span\s+style=['"]mso-spacerun:yes['"]>[^\S\r\n]*?)[\r\n]+([^\S\r\n]*<\/span>)/g, '$1$2')
        .replace(/<span\s+style=['"]mso-spacerun:yes['"]><\/span>/g, '')
        .replace(/(<span\s+style=['"]letter-spacing:[^'"]+?['"]>)[\r\n]+(<\/span>)/g, '$1 $2')
        .replace(/ <\//g, '\u00A0</')
        .replace(/ <o:p><\/o:p>/g, '\u00A0<o:p></o:p>')
        // Remove <o:p> block filler from empty paragraph. Safari uses \u00A0 instead of &nbsp;.
        .replace(/<o:p>(&nbsp;|\u00A0)<\/o:p>/g, '')
        // Remove all whitespaces when they contain any \r or \n.
        .replace(/>([^\S\r\n]*[\r\n]\s*)</g, '><');
}
/**
 * Normalizes spacing in special Word `spacerun spans` (`<span style='mso-spacerun:yes'>\s+</span>`) by replacing
 * all spaces with `&nbsp; ` pairs. This prevents spaces from being removed during further DOM/View processing
 * (see especially {@link module:engine/view/domconverter~DomConverter#_processDomInlineNodes}).
 *
 * @param htmlDocument Native `Document` object in which spacing should be normalized.
 */
export function normalizeSpacerunSpans(htmlDocument) {
    htmlDocument.querySelectorAll('span[style*=spacerun]').forEach(el => {
        const htmlElement = el;
        const innerTextLength = htmlElement.innerText.length || 0;
        htmlElement.innerText = Array(innerTextLength + 1).join('\u00A0 ').substr(0, innerTextLength);
    });
}
/**
 * Normalizes specific spacing generated by Safari when content pasted from Word (`<span class="Apple-converted-space"> </span>`)
 * by replacing all spaces sequences longer than 1 space with `&nbsp; ` pairs. This prevents spaces from being removed during
 * further DOM/View processing (see especially {@link module:engine/view/domconverter~DomConverter#_processDataFromDomText}).
 *
 * This function is similar to {@link module:clipboard/utils/normalizeclipboarddata normalizeClipboardData util} but uses
 * regular spaces / &nbsp; sequence for replacement.
 *
 * @param htmlString HTML string in which spacing should be normalized
 * @returns Input HTML with spaces normalized.
 */
function normalizeSafariSpaceSpans(htmlString) {
    return htmlString.replace(/<span(?: class="Apple-converted-space"|)>(\s+)<\/span>/g, (fullMatch, spaces) => {
        return spaces.length === 1 ? ' ' : Array(spaces.length + 1).join('\u00A0 ').substr(0, spaces.length);
    });
}
