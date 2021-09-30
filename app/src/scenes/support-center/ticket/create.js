import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom";

import api from "../../../services/api";
import { HeroContainer } from "../../../components/Content";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";

export default () => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);

  //todo : fetch zammad categories (scopes)
  const options = ["Assistance technique", "À propos de ma situation", "Contacter un référent"];
  const tags = [`COHORTE_${young.cohort}`, `DEPARTEMENT_${young.department}`, `REGION_${young.region}`, `EMETTEUR_Volontaire`, `CANAL_Plateforme`,];

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/support-center/ticket`);
      console.log({ data });
    })();
  }, []);
  return (
    <Container>
      <BackButton to={`/support`}>{"<"} Retour</BackButton>
      <Heading>
        <h2>Contacter le support</h2>
        <p>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l'un de vos référents ?</p>
      </Heading>
      <Form>
        <Formik
          initialValues={{ type: "", subject: "", message: "", tags: [] }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            // return console.log(values);
            try {
              const { subject, type, message } = values;
              console.log('TAGS', tags);
              if (type === "Assistance technique") {
                tags.push("AGENT_Startup_Technique");
              } else if (type === "À propos de ma situation") {
                tags.push("AGENT_STARTUP_Support");
              } else if (type === "Contacter un référent") {
                tags.push("AGENT_Référent_Département");
              }
              const { ok, code, data } = await api.post("/support-center/ticket", {
                subject,
                type,
                message,
                tags
              });
              if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
              toastr.success("Ticket créé");
              history.push("/support");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            }
          }}
        >
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <Item
                name="type"
                title="Ma demande"
                type="select"
                value={values.type}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
                options={options}
              />
              <Item
                name="subject"
                title="Sujet"
                type="input"
                value={values.subject}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
              />
              <Item
                name="message"
                title="Mon message"
                type="textarea"
                value={values.message}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
                rows="5"
              />
              <ContinueButton type="submit" style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting}>
                Envoyer
              </ContinueButton>
            </>
          )}
        </Formik>
      </Form>
    </Container>
  );
};

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option value="" disabled>
            Catégorie
          </option>
          {options?.map((option) => (
            <option option value={option} key={option} >
              {option}
            </option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const BackButton = styled(NavLink)`
  color: #666;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const Container = styled(HeroContainer)`
  display: flex;
  margin-top: -1rem;
  flex-direction: column;
`;

const Heading = styled.header`
  padding: 1.5rem;
  font-size: 3rem;
  flex: 1;
  p {
    font-size: 1.2rem;
    color: #6b7280;
  }
  @media (max-width: 767px) {
    padding: 1.2rem;
    font-size: 1.1rem;
    p {
      font-size: 1rem;
      color: #6b7280;
    }
  }
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const ContinueButton = styled.button`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  color: #fff;
  background-color: #5145cd;
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: auto;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
  margin-top: 1rem;
  :hover {
    opacity: 0.9;
  }
`;

const Form = styled.div`
  display: flex;
  flex: 2;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  background-color: #fff;
  margin: 0 auto;
  width: clamp(700px, 80%, 1000px);
  @media (max-width: 767px) {
    width: 100%;
  }
`;
