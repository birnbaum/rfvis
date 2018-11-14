/**
 * Original source: https://github.com/toomuchdesign/react-minimal-pie-chart
 */

import React from 'react';
import PropTypes from 'prop-types';
import partialCircle from 'svg-partial-circle';

const degreesToRadians = degrees => (degrees * Math.PI) / 180;

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