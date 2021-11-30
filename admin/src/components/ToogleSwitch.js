import React from "react";
import styled from "styled-components";

/*
Toggle Switch Component
Note: id, checked and onChange are required for ToggleSwitch component to function.
The props name, small, disabled and optionLabels are optional.
Usage: <ToggleSwitch id={id} checked={value} onChange={checked => setValue(checked)}} />
*/

export default function ToggleSwitch({ id, name, checked, onChange, optionLabels = ["Oui", "Non"], small, disabled }) {
  function handleKeyPress(e) {
    if (e.keyCode !== 32) return;

    e.preventDefault();
    onChange(!checked);
  }

  return (
    <Toggle className={"toggle-switch" + (small ? " small-switch" : "")}>
      <input type="checkbox" name={name} className="toggle-switch-checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      {id ? (
        <label
          className="toggle-switch-label"
          htmlFor={id}
          tabIndex={disabled ? -1 : 1}
          onKeyDown={(e) => {
            handleKeyPress(e);
          }}>
          <span className={disabled ? "toggle-switch-inner toggle-switch-disabled" : "toggle-switch-inner"} data-yes={optionLabels[0]} data-no={optionLabels[1]} tabIndex={-1} />
          {/* <span className={disabled ? "toggle-switch-switch toggle-switch-disabled" : "toggle-switch-switch"} tabIndex={-1} /> */}
        </label>
      ) : null}
    </Toggle>
  );
}

const Toggle = styled.div`
  .toggle-switch {
    position: relative;
    margin-right: 10px;
    width: 75px;
    display: inline-block;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    text-align: left;
  }
  .toggle-switch-checkbox {
    display: none;
  }
  .toggle-switch-label {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border: 0 solid #bbb;
    border-radius: 20px;
    margin: 0;
  }
  .toggle-switch-label:focus {
    outline: none;
  }
  .toggle-switch-label:focus > span {
    box-shadow: 0 0 2px 5px red;
  }
  .toggle-switch-label > span:focus {
    outline: none;
  }
  .toggle-switch-inner {
    display: block;
    width: 200%;
    margin-left: -100%;
    transition: margin 0.3s ease-in 0s;
  }
  .toggle-switch-inner:before,
  .toggle-switch-inner:after {
    display: block;
    float: left;
    width: 50%;
    height: 34px;
    padding: 0;
    line-height: 34px;
    font-size: 14px;
    color: white;
    font-weight: bold;
    box-sizing: border-box;
  }
  .toggle-switch-inner:before {
    content: attr(data-yes);
    text-transform: uppercase;
    padding-left: 10px;
    background-color: #2f855a;
    color: #fff;
  }
  .toggle-switch-disabled {
    cursor: not-allowed;
  }
  .toggle-switch-disabled:before {
    cursor: not-allowed;
  }
  .toggle-switch-inner:after {
    content: attr(data-no);
    text-transform: uppercase;
    padding-right: 10px;
    background-color: #bbb;
    color: #fff;
    text-align: right;
  }
  .toggle-switch-switch {
    display: block;
    width: 24px;
    margin: 5px;
    background: #fff;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 40px;
    border: 0 solid #bbb;
    border-radius: 20px;
    transition: all 0.3s ease-in 0s;
  }
  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-inner {
    margin-left: 0;
  }
  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-switch {
    right: 0px;
  }
  .toggle-switch.small-switch {
    width: 40px;
  }
  .toggle-switch.small-switch .toggle-switch-inner:after,
  .toggle-switch.small-switch .toggle-switch-inner:before {
    content: "";
    height: 20px;
    line-height: 20px;
  }
  .toggle-switch.small-switch .toggle-switch-switch {
    width: 16px;
    right: 20px;
    margin: 2px;
  }
  @media screen and (max-width: 991px) {
    .toggle-switch {
      transform: scale(0.9);
    }
  }
  @media screen and (max-width: 767px) {
    .toggle-switch {
      transform: scale(0.825);
    }
  }
  @media screen and (max-width: 575px) {
    .toggle-switch {
      transform: scale(0.75);
    }
  }
`;
