import React, { useState } from "react";
import { Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Field, Formik } from "formik";
import { toastr } from "react-redux-toastr";
import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import ErrorMessage, { requiredMessage } from "../inscription2023/components/ErrorMessageOld";
import { getPasswordErrorMessage, translate } from "../../utils";
import validator from "validator";
import AddressInputV2 from "../../components/addressInput";
import ModalConfirm from "../../components/modals/ModalConfirm";
import PasswordEye from "../../components/PasswordEye";
import { appURL } from "../../config";
import { putLocation } from "../../services/api-adresse";
import { youngCanChangeSession, YOUNG_STATUS } from "snu-lib";
import FormRow from "../../components/forms/FormRow";
import ContinueButton from "../../components/buttons/ContinueButton";
import DeleteAccountButton from "../../components/buttons/DeleteAccountButton";
import ChangeStayButton from "../../components/buttons/ChangeStayButton";
import WithdrawalModal from "./components/WithdrawalModal";
import PhoneField from "./components/PhoneField";
import { isPhoneNumberWellFormated, PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";

export default function Account() {
  const search = useLocation().search;
  const isWithdrawalModalOpenDefault = new URLSearchParams(search).get("desistement") === "1";
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, onConfirm: null });
  const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(isWithdrawalModalOpenDefault);

  const updateYoung = async (values) => {
    values.email = values.email?.trim();
    try {
      if (!values.location || !values.location.lat || !values.location.lon) {
        values.location = await putLocation(values.city, values.zip);
      }
      if (!values.location) return toastr.error("Il y a un problème avec le nom de la ville et/ou le code postal.");
      const { ok, code, data: young } = await api.put("/young", values);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(young));
      toastr.success("Mis à jour!");
      return history.push("/");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
    }
  };

  return (
    <div className="rounded-sm bg-white py-5 px-10 drop-shadow-lg">
      <div className="mb-[30px]">
        <span className="mb-[5px] text-base font-bold text-snu-primary">{`${young.firstName} ${young.lastName}`}</span>
        <h1 className="mb-0 text-3xl font-extrabold text-[#161e2e] md:text-5xl">Mes paramètres</h1>
      </div>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) {
              if (code === "USER_ALREADY_REGISTERED")
                return toastr.error("Cet identifiant est déjà utilisé, pour plus d'informations contactez le support : contact@snu.gouv.fr ", { timeOut: 10000 });
              return toastr.error("Une erreur s'est produite :", translate(code));
            }
            dispatch(setYoung(young));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <h2 className="mb-6  text-2xl font-bold md:text-3xl">Email</h2>
            <FormRow>
              <Item
                name="email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v.trim()) && "Ce champ est au mauvais format")}
                errors={errors}
                touched={touched}
              />
              <ContinueButton onClick={handleSubmit} disabled={isSubmitting}>
                Enregistrer
              </ContinueButton>
            </FormRow>
          </>
        )}
      </Formik>
      <Formik
        initialValues={{ password: "", newPassword: "", verifyPassword: "" }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async ({ password, verifyPassword, newPassword }) => {
          try {
            const { ok, code, user } = await api.post("/young/reset_password", { password, verifyPassword, newPassword });
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(user));
            toastr.success("Mot de passe mis à jour!");
            return history.push("/");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour du mot de passe :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <h2 className="mb-6  text-2xl font-bold md:text-3xl">Mot de passe</h2>
            <hr />
            <Item required name="password" title="Actuel" errors={errors} touched={touched}>
              <PasswordEye
                type="password"
                validate={getPasswordErrorMessage}
                placeholder=""
                name="password"
                // eslint-disable-next-line react/jsx-no-duplicate-props
                validate={(v) => !v && requiredMessage}
                value={values.password}
                onChange={handleChange}
              />
            </Item>
            <Item required name="newPassword" title="Nouveau" errors={errors} touched={touched}>
              <PasswordEye type="password" validate={getPasswordErrorMessage} placeholder="" name="newPassword" value={values.newPassword} onChange={handleChange} />
            </Item>
            <Item required name="verifyPassword" title="Confirmer" errors={errors} touched={touched}>
              <PasswordEye
                type="password"
                title="Confirmer"
                placeholder=""
                validate={(v) => (!v && requiredMessage) || (v !== values.newPassword && "Les mots de passe renseignés ne sont pas identiques")}
                name="verifyPassword"
                value={values.verifyPassword}
                onChange={handleChange}
              />
            </Item>
            <div style={{ marginLeft: -15 }}></div>
            <ContinueButton onClick={handleSubmit} disabled={isSubmitting} style={{ margin: "2rem 0" }}>
              Valider mon nouveau mot de passe
            </ContinueButton>
          </>
        )}
      </Formik>

      <Formik
        initialValues={{
          ...young,
          phoneZone: young.phoneZone || PHONE_ZONES_NAMES.FRANCE,
          parent1PhoneZone: young.parent1PhoneZone || PHONE_ZONES_NAMES.FRANCE,
          parent2PhoneZone: young.parent2PhoneZone || PHONE_ZONES_NAMES.FRANCE,
        }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          if (young.address !== values.address || young.city !== values.city || young.department !== values.department || young.region !== values.region) {
            return setConfirmationModal({
              isOpen: true,
              title: "J'ai déménagé",
              message: (
                <p>
                  <b>Attention, vous êtes sur le point de déclarer un déménagement.</b>
                  <br />
                  Votre référent départemental recevra un mail.
                  <br />
                  <br />
                  <i>
                    Si vous souhaitez accéder à une autre zone de recherche pour la proposition des missions, vous pouvez renseigner l&apos;adresse d’un proche dans{" "}
                    <a className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline" href={`${appURL}/preferences`} target="_blank" rel="noreferrer">
                      vos préférences
                    </a>{" "}
                    de missions.
                  </i>
                </p>
              ),
              onConfirm: async () => updateYoung(values),
            });
          } else updateYoung(values);
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched, validateField }) => (
          <>
            <h2 className="mb-6  text-2xl font-bold md:text-3xl">Mon profil</h2>
            <FormRow>
              <Item name="firstName" values={values} handleChange={handleChange} title="Prénom" disabled />
              <Item name="lastName" values={values} handleChange={handleChange} title="Nom" disabled />
              <Select
                name="gender"
                values={values}
                handleChange={handleChange}
                title="Sexe"
                options={[
                  { value: "male", label: "Masculin" },
                  { value: "female", label: "Feminin" },
                ]}
              />
              <Item>
                <PhoneField
                  name="phone"
                  selectZoneName="phoneZone"
                  value={values.phone}
                  zoneValue={values.phoneZone}
                  onChange={handleChange}
                  onChangeZone={handleChange}
                  placeholder={PHONE_ZONES[values.phoneZone]?.example}
                  error={errors.phone}
                  validate={(value) => value && !isPhoneNumberWellFormated(value, values.phoneZone) && PHONE_ZONES[values.phoneZone].errorMessage}
                />
              </Item>
            </FormRow>
            <div style={{ marginBottom: "1.5rem" }}>
              <AddressInputV2
                countryByDefault="France"
                keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region", country: "country" }}
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                validateField={validateField}
              />
            </div>
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Représentant Légal</h2>
            <FormRow>
              <Select
                name="parent1Status"
                values={values}
                handleChange={handleChange}
                title="Statut du représentant légal 1"
                options={[
                  { value: "mother", label: "Mère" },
                  { value: "father", label: "Père" },
                  { value: "representant", label: "Représentant légal" },
                ]}
              />
              <Item name="parent1FirstName" values={values} handleChange={handleChange} title="Prénom" validate={(v) => !v && requiredMessage} errors={errors} />
              <Item name="parent1LastName" values={values} handleChange={handleChange} title="Nom" validate={(v) => !v && requiredMessage} errors={errors} />
              <Item
                name="parent1Email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
              />
              <Item>
                <PhoneField
                  name="parent1Phone"
                  selectZoneName="parent1PhoneZone"
                  value={values.parent1Phone}
                  zoneValue={values.parent1PhoneZone}
                  onChange={handleChange}
                  onChangeZone={handleChange}
                  placeholder={PHONE_ZONES[values.parent1PhoneZone]?.example}
                  error={errors.parent1Phone}
                  validate={(value) => value && !isPhoneNumberWellFormated(value, values.parent1PhoneZone) && PHONE_ZONES[values.parent1PhoneZone].errorMessage}
                />
              </Item>
            </FormRow>
            <FormRow margin="0">
              <Select
                name="parent2Status"
                values={values}
                handleChange={handleChange}
                title="Statut du représentant légal 2 (facultatif)"
                options={[
                  { value: undefined, label: "Aucun" },
                  { value: "mother", label: "Mère" },
                  { value: "father", label: "Père" },
                  { value: "representant", label: "Représentant légal" },
                ]}
              />
              <Item name="parent2FirstName" values={values} handleChange={handleChange} title="Prénom" />
              <Item name="parent2LastName" values={values} handleChange={handleChange} title="Nom" />
              <Item
                name="parent2Email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => v && !validator.isEmail(v) && "Ce champ est au mauvais format"}
                errors={errors}
              />
              <Item>
                <PhoneField
                  name="parent2Phone"
                  selectZoneName="parent2PhoneZone"
                  value={values.parent2Phone}
                  zoneValue={values.parent2PhoneZone}
                  onChange={handleChange}
                  onChangeZone={handleChange}
                  placeholder={PHONE_ZONES[values.parent2PhoneZone]?.example}
                  error={errors.parent2Phone}
                  validate={(value) => value && !isPhoneNumberWellFormated(value, values.parent2PhoneZone) && PHONE_ZONES[values.parent2PhoneZone].errorMessage}
                />
              </Item>
            </FormRow>
            <ContinueButton onClick={handleSubmit} disabled={isSubmitting}>
              Enregistrer
            </ContinueButton>
            <ModalConfirm
              isOpen={confirmationModal?.isOpen}
              title={confirmationModal?.title}
              message={confirmationModal?.message}
              onCancel={() => setConfirmationModal({ isOpen: false, onConfirm: null })}
              onConfirm={() => {
                confirmationModal?.onConfirm();
                setConfirmationModal({ isOpen: false, onConfirm: null });
              }}
            />
            <WithdrawalModal isOpen={isWithdrawalModalOpen} onCancel={() => setWithdrawalModalOpen(false)} young={young} />
          </>
        )}
      </Formik>
      <div className="mt-12 flex flex-col justify-center text-center md:flex-row md:gap-8">
        {youngCanChangeSession(young) ? <ChangeStayButton /> : null}
        {[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST].includes(young.status) ? (
          <DeleteAccountButton young={young} onClick={() => setWithdrawalModalOpen(true)} />
        ) : null}
      </div>
    </div>
  );
}

const Item = ({ title, name, values, handleChange, errors, touched, validate, type, children, ...props }) => {
  return (
    <Col lg={4} style={{ marginTop: 20 }}>
      {title && <label className="mb-[5px] text-sm font-semibold text-gray-700">{title}</label>}
      {children || <Field type={type} className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate} {...props} />}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Select = ({ title, name, values, handleChange, errors, touched, validate, options }) => {
  return (
    <Col lg={4} style={{ marginTop: 20 }}>
      <label className="mb-[5px] text-sm font-semibold text-gray-700">{title}</label>
      <select className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate}>
        {options.map((o, i) => (
          <option key={i} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};
