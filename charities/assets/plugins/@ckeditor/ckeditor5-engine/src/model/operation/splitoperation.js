/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module engine/model/operation/splitoperation
 */
import Operation from './operation';
import MergeOperation from './mergeoperation';
import Position from '../position';
import Range from '../range';
import { _insert, _move } from './utils';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
/**
 * Operation to split {@link module:engine/model/element~Element an element} at given
 * {@link module:engine/model/operation/splitoperation~SplitOperation#splitPosition split position} into two elements,
 * both containing a part of the element's original content.
 */
export default class SplitOperation extends Operation {
    /**
     * Creates a split operation.
     *
     * @param splitPosition Position at which an element should be split.
     * @param howMany Total offset size of elements that are in the split element after `position`.
     * @param insertionPosition Position at which the clone of split element (or element from graveyard) will be inserted.
     * @param graveyardPosition Position in the graveyard root before the element which
     * should be used as a parent of the nodes after `position`. If it is not set, a copy of the the `position` parent will be used.
     * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
     * can be applied or `null` if the operation operates on detached (non-document) tree.
     */
    constructor(splitPosition, howMany, insertionPosition, graveyardPosition, baseVersion) {
        super(baseVersion);
        this.splitPosition = splitPosition.clone();
        // Keep position sticking to the next node. This way any new content added at the place where the element is split
        // will be left in the original element.
        this.splitPosition.stickiness = 'toNext';
        this.howMany = howMany;
        this.insertionPosition = insertionPosition;
        this.graveyardPosition = graveyardPosition ? graveyardPosition.clone() : null;
        if (this.graveyardPosition) {
            this.graveyardPosition.stickiness = 'toNext';
        }
    }
    /**
     * @inheritDoc
     */
    get type() {
        return 'split';
    }
    /**
     * Position inside the new clone of a split element.
     *
     * This is a position where nodes that are after the split position will be moved to.
     */
    get moveTargetPosition() {
        const path = this.insertionPosition.path.slice();
        path.push(0);
        return new Position(this.insertionPosition.root, path);
    }
    /**
     * Artificial range that contains all the nodes from the split element that will be moved to the new element.
     * The range starts at {@link #splitPosition} and ends in the same parent, at `POSITIVE_INFINITY` offset.
     */
    get movedRange() {
        const end = this.splitPosition.getShiftedBy(Number.POSITIVE_INFINITY);
        return new Range(this.splitPosition, end);
    }
    /**
     * @inheritDoc
     */
    get affectedSelectable() {
        // These could be positions but `Selectable` type only supports `Iterable<Range>`.
        const ranges = [
            Range._createFromPositionAndShift(this.splitPosition, 0),
            Range._createFromPositionAndShift(this.insertionPosition, 0)
        ];
        if (this.graveyardPosition) {
            ranges.push(Range._createFromPositionAndShift(this.graveyardPosition, 0));
        }
        return ranges;
    }
    /**
     * Creates and returns an operation that has the same parameters as this operation.
     *
     * @returns Clone of this operation.
     */
    clone() {
        return new SplitOperation(this.splitPosition, this.howMany, this.insertionPosition, this.graveyardPosition, this.baseVersion);
    }
    /**
     * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
     */
    getReversed() {
        const graveyard = this.splitPosition.root.document.graveyard;
        const graveyardPosition = new Position(graveyard, [0]);
        return new MergeOperation(this.moveTargetPosition, this.howMany, this.splitPosition, graveyardPosition, this.baseVersion + 1);
    }
    /**
     * @inheritDoc
     * @internal
     */
    _validate() {
        const element = this.splitPosition.parent;
        const offset = this.splitPosition.offset;
        // Validate whether split operation has correct parameters.
        if (!element || element.maxOffset < offset) {
            /**
             * Split position is invalid.
             *
             * @error split-operation-position-invalid
             */
            throw new CKEditorError('split-operation-position-invalid', this);
        }
        else if (!element.parent) {
            /**
             * Cannot split root element.
             *
             * @error split-operation-split-in-root
             */
            throw new CKEditorError('split-operation-split-in-root', this);
        }
        else if (this.howMany != element.maxOffset - this.splitPosition.offset) {
            /**
             * Split operation specifies wrong number of nodes to move.
             *
             * @error split-operation-how-many-invalid
             */
            throw new CKEditorError('split-operation-how-many-invalid', this);
        }
        else if (this.graveyardPosition && !this.graveyardPosition.nodeAfter) {
            /**
             * Graveyard position invalid.
             *
             * @error split-operation-graveyard-position-invalid
             */
            throw new CKEditorError('split-operation-graveyard-position-invalid', this);
        }
    }
    /**
     * @inheritDoc
     * @internal
     */
    _execute() {
        const splitElement = this.splitPosition.parent;
        if (this.graveyardPosition) {
            _move(Range._createFromPositionAndShift(this.graveyardPosition, 1), this.insertionPosition);
        }
        else {
            const newElement = splitElement._clone();
            _insert(this.insertionPosition, newElement);
        }
        const sourceRange = new Range(Position._createAt(splitElement, this.splitPosition.offset), Position._createAt(splitElement, splitElement.maxOffset));
        _move(sourceRange, this.moveTargetPosition);
    }
    /**
     * @inheritDoc
     */
    toJSON() {
        const json = super.toJSON();
        json.splitPosition = this.splitPosition.toJSON();
        json.insertionPosition = this.insertionPosition.toJSON();
        if (this.graveyardPosition) {
            json.graveyardPosition = this.graveyardPosition.toJSON();
        }
        return json;
    }
    /**
     * @inheritDoc
     */
    static get className() {
        return 'SplitOperation';
    }
    /**
     * Helper function that returns a default insertion position basing on given `splitPosition`. The default insertion
     * position is after the split element.
     */
    static getInsertionPosition(splitPosition) {
        const path = splitPosition.path.slice(0, -1);
        path[path.length - 1]++;
        return new Position(splitPosition.root, path, 'toPrevious');
    }
    /**
     * Creates `SplitOperation` object from deserialized object, i.e. from parsed JSON string.
     *
     * @param json Deserialized JSON object.
     * @param document Document on which this operation will be applied.
     */
    static fromJSON(json, document) {
        const splitPosition = Position.fromJSON(json.splitPosition, document);
        const insertionPosition = Position.fromJSON(json.insertionPosition, document);
        const graveyardPosition = json.graveyardPosition ? Position.fromJSON(json.graveyardPosition, document) : null;
        return new this(splitPosition, json.howMany, insertionPosition, graveyardPosition, json.baseVersion);
    }
}
