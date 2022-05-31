import React from "react";
import styled from "styled-components";
import { Row } from "reactstrap";
import { Formik } from "formik";
import "dayjs/locale/fr";

import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import Identite from "./edit/identite";
import Coordonnees from "./edit/coordonnees";
import Situation from "./edit/situation";
import SituationsParticulieres from "./edit/situations-particulieres";
import Representant1 from "./edit/representant-legal1";
import Representant2 from "./edit/representant-legal2";
import Consentement from "./edit/consentement";
import ConsentementImage from "./edit/consentement-image";
import ChevronDown from "../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";

export default function Create() {
  const history = useHistory();
  const options = ["Juillet 2022", "à venir"];
  const [open, setOpen] = React.useState(false);

  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <Wrapper>
      <Formik
        initialValues={{
          status: "VALIDATED",
          firstName: "",
          lastName: "",
          birthdateAt: "",
          cniFiles: [],
          email: "",
          phone: "",
          address: "",
          city: "",
          zip: "",
          department: "",
          region: "",
          parentConsentmentFiles: [],
          highSkilledActivityProofFiles: [],
          imageRightFiles: [],
          cohort: options[0],
        }}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={async (values) => {
          try {
            const { ok, code } = await api.post("/young/invite", values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Volontaire créé !");
            return history.push("/inscription");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched, setFieldValue, validateField }) => (
          <>
            <div className="flex items-center justify-between my-8">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{`Création du profil ${values.firstName ? `de ${values.firstName}  ${values.lastName}` : ""}`}</div>
                <div style={{ fontFamily: "Marianne" }} ref={ref}>
                  <div className="relative">
                    {/* select item */}
                    <button
                      className="flex items-center justify-between gap-3 px-4 py-2 rounded-full border-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-wait min-w-[130px] border-blue-500 bg-blue-50/75"
                      style={{ fontFamily: "Marianne" }}
                      onClick={() => setOpen((e) => !e)}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm whitespace-nowrap text-blue-600">{values.cohort}</span>
                      </div>

                      <ChevronDown className="text-blue-500" />
                    </button>

                    {/* display options */}
                    <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0  shadow overflow-hidden z-50`}>
                      {options.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setFieldValue("cohort", option);
                            setOpen(false);
                          }}
                          className={`${option === values.cohort && "font-bold bg-gray"}`}>
                          <div className="group flex justify-between items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <div>{option}</div>
                            {option === values.cohort ? <BsCheck2 /> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Valider cette candidature
              </SaveBtn>
            </div>
            {Object.values(errors).filter((e) => !!e).length ? (
              <Alert>Vous ne pouvez pas enregistrer ce volontaires car tous les champs ne sont pas correctement renseignés.</Alert>
            ) : null}
            <Row>
              <Identite
                values={values}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                required={{ firstName: true, lastName: true, birthdateAt: true, gender: true }}
                errors={errors}
                touched={touched}
              />
              <Coordonnees
                values={values}
                handleChange={handleChange}
                required={{ email: true, phone: true, address: true, city: true, zip: true, department: true, region: true }}
                errors={errors}
                touched={touched}
                validateField={validateField}
              />
              <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} touched={touched} />
              <SituationsParticulieres values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
            <Row>
              <Representant1 values={values} handleChange={handleChange} />
              <Representant2 values={values} handleChange={handleChange} />
            </Row>
            <Row>
              <Consentement values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <ConsentementImage values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px 40px;
`;

const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    background-color: #5245cc;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;

const Alert = styled.h3`
  border: 1px solid #fc8181;
  border-radius: 0.25em;
  background-color: #fff5f5;
  color: #c53030;
  font-weight: 400;
  font-size: 12px;
  padding: 1em;
  text-align: center;
`;

const SaveBtn = styled(LoadingButton)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
  &.outlined {
    :hover {
      background: #fff;
    }
    background-color: transparent;
    border: solid 1px #5245cc;
    color: #5245cc;
    font-size: 13px;
    padding: 4px 20px;
  }
`;
