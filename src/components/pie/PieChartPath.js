/**
 * Original source: https://github.com/toomuchdesign/react-minimal-pie-chart
 */

import React from 'react';
import PropTypes from 'prop-types';


const degreesToRadians = degrees => (degrees * Math.PI) / 180;

// from http://stackoverflow.com/a/18473154
const partialCircle = (cx, cy, r, start, end) => {
    const length = end - start;
    if (length === 0) return [];

    const fromX = r * Math.cos(start) + cx;
    const fromY = r * Math.sin(start) + cy;
    const toX = r * Math.cos(end) + cx;
    const toY = r * Math.sin(end) + cy;
    const large = Math.abs(length) <= Math.PI ? '0' : '1';
    const sweep = length < 0 ? '0' : '1';

    return [
        ['M', fromX, fromY],
        ['A', r, r, 0, large, sweep, toX, toY]
    ]
};

const makePathCommands = (cx, cy, startAngle, lengthAngle, radius) => {
    let patchedLengthAngle = lengthAngle;
    if (patchedLengthAngle >= 360) patchedLengthAngle = 359.999;
    if (patchedLengthAngle <= -360) patchedLengthAngle = -359.999;

    return partialCircle(
        cx,
        cy, // center X and Y
        radius,
        degreesToRadians(startAngle),
        degreesToRadians(startAngle + patchedLengthAngle)
    )
        .map(command => command.join(' '))
        .join(' ');
};

export default function ReactMinimalPieChartPath({
    cx,
    cy,
    startAngle,
    lengthAngle,
    radius,
    ...props
}) {
    const pathCommands = makePathCommands(cx, cy, startAngle, lengthAngle, radius/2);
    return <path d={pathCommands}
                 strokeWidth={radius}
                 {...props} />;
}

ReactMinimalPieChartPath.propTypes = {
    cx: PropTypes.number.isRequired,
    cy: PropTypes.number.isRequired,
    startAngle: PropTypes.number,
    lengthAngle: PropTypes.number,
    radius: PropTypes.number.isRequired,
};