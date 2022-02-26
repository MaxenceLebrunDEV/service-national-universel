import * as React from "react";

const SvgComponent = (props) => (
  <svg height={15} viewBox="-56 0 512 512" width={15} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M395.98 112.582 287.957 4.559A15.592 15.592 0 0 0 276.937 0h-156.34C112 0 105.02 6.98 105.02 15.578v89.445H15.578C6.98 105.023 0 112 0 120.602v375.82C0 505.02 6.98 512 15.578 512h264.36c8.601 0 15.582-6.98 15.582-15.578v-89.445h89.44c8.599 0 15.58-6.977 15.58-15.579V123.602c0-3.961-1.524-7.985-4.56-11.02zM369.383 375.82H295.52V228.625c0-4.035-1.57-8.031-4.563-11.023l-108.02-108.02a15.587 15.587 0 0 0-11.019-4.562H136.18V31.156h125.18v92.446c0 8.597 6.98 15.578 15.577 15.578h92.446zM264.359 480.844H31.156V136.18h125.18v92.445c0 8.598 6.98 15.578 15.582 15.578h92.441zm-76.863-322.637 54.836 54.836h-54.836zm159.856-50.184h-54.836V53.187c6.855 6.852 49.367 49.368 54.836 54.836zm0 0" />
  </svg>
);

export default SvgComponent;
