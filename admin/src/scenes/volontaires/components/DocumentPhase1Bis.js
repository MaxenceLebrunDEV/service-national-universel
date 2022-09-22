import React, { useEffect, useState, useRef } from "react";
import { toastr } from "react-redux-toastr";
import FileIcon from "../../../assets/FileIcon";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { FILE_STATUS_PHASE1, SENDINBLUE_TEMPLATES, translate, translateFileStatusPhase1 } from "../../../utils";
import ButtonPlain from "./ButtonPlain";
// import ModalDocument from "./ModalDocument";
import Download from "../../../assets/icons/Download";
import MoreMenu from "../../../assets/icons/MoreMenu";
import { Modal } from "reactstrap";
import CloseSvg from "../../../assets/Close";
import { Formik, Field } from "formik";
import ModalButton from "../../../components//buttons/ModalButton";
import Select from "../../../components/Select";
import DndFileInput from "../../../components/dndFileInput";
import { ModalContainer } from "../../../components/modals/Modal";
import Switch from "react-switch";

export default function DocumentPhase1(props) {
  const [young, setYoung] = useState(props.young);
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
  const [statusAutoTestPCR, setStatusAutoTestPCR] = useState();
  const [statusImageRight, setStatusImageRight] = useState();
  const [statusRules, setStatusRules] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);
  const [dataImageRight, setDataImageRight] = useState();
  const [dataAutoTestPCR, setDataAutoTestPCR] = useState();
  const [isOpenImg, setIsOpenImg] = useState(false);
  const [isOpenAut, setIsOpenAut] = useState(false);
  const [checkedImg, setCheckedImg] = useState(false);
  const [checkedAut, setCheckedAut] = useState(false);
  const options = [FILE_STATUS_PHASE1.TO_UPLOAD, FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED];
  const ref = useRef(null);

  const medicalFileOptions = [
    { value: "RECEIVED", label: "Réceptionné" },
    { value: "TO_DOWNLOAD", label: "Non téléchargé" },
    { value: "DOWNLOADED", label: "Téléchargé" },
  ];

  const medicalFileValue = {
    RECEIVED: { cohesionStayMedicalFileReceived: "true", cohesionStayMedicalFileDownload: "true" },
    TO_DOWNLOAD: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "false" },
    DOWNLOADED: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "true" },
  };

  const rulesFileOptions = [
    { value: "true", label: "Accepté" },
    { value: "false", label: "Non renseigné" },
  ];

  const updateYoung = async () => {
    const { data } = await api.get(`/referent/young/${young._id}`);
    if (data) setYoung(data);
    setLoading(false);
  };

  const handleEmailClick = async (view) => {
    setLoading(true);
    let template;
    let body = {};
    if (["autoTestPCR", "imageRight", "rules"].includes(view)) {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_DOCUMENT;
      body = { type_document: translateFileStatusPhase1(view) };
    } else if (view === "cohesionStayMedical") {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_MEDICAL_FILE;
    }

    try {
      const { ok } = await api.post(`/young/${young._id}/email/${template}`, body);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la relance du volontaire");
      toastr.success("Relance du volontaire envoyée avec succès");
      setLoading(false);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoie de la relance :", translate(e.code));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (young) {
      if (young.cohesionStayMedicalFileReceived !== "true") {
        if (young.cohesionStayMedicalFileDownload === "false") {
          setStatusCohesionStayMedical("TO_DOWNLOAD");
        } else {
          setStatusCohesionStayMedical("DOWNLOADED");
        }
      } else {
        setStatusCohesionStayMedical("RECEIVED");
      }

      setStatusAutoTestPCR(young.autoTestPCRFilesStatus);
      setStatusImageRight(young.imageRightFilesStatus);
      setStatusRules(young.rulesYoung);
      setDataImageRight({
        imageRight: young.imageRight,
        imageRightFiles: young.files.imageRightFiles,
      });
      setDataAutoTestPCR({
        autoTestPCR: young.autoTestPCR,
        autoTestPCRFiles: young.files.autoTestPCRFiles,
      });
      if (young.imageRight && young.imageRight === "true") {
        setCheckedImg(true);
      } else {
        setCheckedImg(false);
      }
    }
  }, [young]);

  const setState = (key, value) => {
    switch (key) {
      case "cohesionStayMedical":
        setStatusCohesionStayMedical(value);
        break;
      case "autoTestPCR":
        setStatusAutoTestPCR(value);
        break;
      case "imageRight":
        setStatusImageRight(value);
        break;
      case "rules":
        setStatusRules(value);
        break;
    }
  };

  const needModal = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setLoading(true);

    if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION) {
      setModal({
        isOpen: true,
        onConfirm: (correctionMessage) => {
          setState(name, value);
          handleChange({ value, name, correctionMessage });
        },
        title: `Vous êtes sur le point de demander la correction du document ${translateFileStatusPhase1(name)}`,
        message: `Car celui n’est pas conforme. Merci de préciser ci-dessous les corrections à apporter.
        Une fois le message validé, il sera transmis par mail à ${young.firstName} ${young.lastName} (${young.email}).`,
      });
    } else {
      setState(name, value);
      handleChange({ value, name });
    }
  };

  const handleChange = async ({ value, name, correctionMessage = null }) => {
    let params = {};
    console.log(value, name);
    if (["autoTestPCR", "imageRight"].includes(name)) {
      params[`${name}FilesStatus`] = value;
      if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION && correctionMessage) {
        params[`${name}FilesComment`] = correctionMessage;
      }
    } else if (name === "cohesionStayMedical") {
      params = medicalFileValue[value];
    } else if (name === "rules") {
      params.rulesYoung = value;
    }

    try {
      const { code, ok } = await api.put(`/referent/young/${young._id}/phase1Status/${name}`, params);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la mise a jour des status :", translate(code));
      toastr.success("Statut mis à jour!");
      updateYoung();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des status :", translate(e.code));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpenImg(false);
        setIsOpenAut(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  if (!dataImageRight && !dataAutoTestPCR) return null;
  console.log("young", young);
  console.log("dataImageRight", dataImageRight);
  console.log("checkedimg==>", checkedImg);

  return (
    <>
      <article className="flex items-start justify-between gap-6 px-2">
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full ">
              <select
                disabled={loading}
                className="form-control w-full mx-3 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusRules}
                name="rules"
                onChange={(e) => needModal(e)}>
                {rulesFileOptions.map((o, i) => (
                  <option key={i} value={o.value} label={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="reglement" filled={young.rulesYoung === "true"} />
            <p className="text-base font-bold mt-2">Règlement intérieur</p>
          </section>

          {statusRules !== "true" && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("rules")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-3 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusCohesionStayMedical}
                name="cohesionStayMedical"
                onChange={(e) => needModal(e)}>
                {medicalFileOptions.map((o) => (
                  <option key={o.label} data-color="green" value={o.value} label={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="sanitaire" filled={young.cohesionStayMedicalFileDownload === "true"} />
            <p className="text-base font-bold mt-2">Fiche sanitaire</p>
          </section>
          {statusCohesionStayMedical === "TO_DOWNLOAD" && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("cohesionStayMedical")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full relative">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-3 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusImageRight}
                name="imageRight"
                onChange={(e) => needModal(e)}>
                {options.map((o, i) => (
                  <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                    {translateFileStatusPhase1(o)}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="image" filled={young.imageRightFilesStatus !== "TO_UPLOAD"} />
            <p className="text-base font-bold mt-2">Droit à l&apos;image</p>
            <p className="text-gray-500">
              Accord : {dataImageRight.imageRight && young.imageRightFilesStatus !== "TO_UPLOAD" ? translate(dataImageRight.imageRight) : "Non renseigné"}
            </p>
            {/* <ButtonPlain onClick={() => setIsOpenImg(true)}>Gérer le document</ButtonPlain> */}
            {dataImageRight.imageRight && (
              <div className="flex flex-col justify-end items-end w-full px-7 mt-1">
                <div className="transition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
                  <Download
                    className=" text-indigo-100 bg-blue-600 "
                    onClick={() => {
                      console.log("clic");
                    }}
                  />
                </div>
                <div
                  className="transition duration-150 flex rounded-full p-2 items-center bg-[#e5e7eb] justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer h-8 w-8 hover:border-2 hover:border-blue-600 mt-1"
                  onClick={() => {
                    setIsOpenImg(true);
                  }}>
                  <MoreMenu className="text-indigo-100" />
                </div>
              </div>
            )}
            {isOpenImg && (
              <div className="rounded-md bg-white border border-gray-300  shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] absolute -bottom-[68px] right-6 w-60 " ref={ref}>
                <div className="relative w-full">
                  <TestModal
                    // initialValues={{ dataImageRight, checked: checkedImg }}
                    values={{ dataImageRight, checked: checkedImg }}
                    updateYoung={updateYoung}
                    young={young}
                    name="imageRight"
                    nameFiles="imageRightFiles"
                    title="Consentement de droit à l'image"
                    comment={young.imageRightFilesComment}
                    // checked={checkedImg}
                    setChecked={setCheckedImg}
                  />
                </div>
              </div>
            )}
          </section>

          {/* <ModalDocument
            isOpen={isOpenImg}
            onCancel={() => setIsOpenImg(false)}
            initialValues={dataImageRight}
            updateYoung={updateYoung}
            young={young}
            name="imageRight"
            nameFiles="imageRightFiles"
            title="Consentement de droit à l'image"
            comment={young.imageRightFilesComment}
          /> */}
          {statusImageRight === FILE_STATUS_PHASE1.TO_UPLOAD && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("imageRight")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-[7px] m-2 flex flex-col items-center justify-start py-3 h-[300px] w-full">
            <div className="flex row justify-center mx-2 mb-3 w-full">
              <select
                disabled={loading}
                className="form-control w-full mx-3 py-[8px] pr-[13px] pl-[17px] h-[40px] text-xs text-medium rounded-[6px] border-[1px] border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                value={statusAutoTestPCR}
                name="autoTestPCR"
                onChange={(e) => needModal(e)}>
                {options.map((o) => (
                  <option key={o} value={o} label={translateFileStatusPhase1(o)}>
                    {translateFileStatusPhase1(o)}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="autotest" filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"} />
            <p className="text-base font-bold mt-2">Autotest PCR</p>
            <p className="text-gray-500">
              Accord : {dataAutoTestPCR.autoTestPCR && young.autoTestPCRFilesStatus !== "TO_UPLOAD" ? translate(dataAutoTestPCR.autoTestPCR) : "Non renseigné"}
            </p>
            <ButtonPlain onClick={() => setIsOpenAut(true)}>Gérer le document</ButtonPlain>
          </section>
          <ModalDocument
            isOpen={isOpenAut}
            onCancel={() => setIsOpenAut(false)}
            initialValues={dataAutoTestPCR}
            young={young}
            name="autoTestPCR"
            nameFiles="autoTestPCRFiles"
            title="Consentement à l'utilisation d'autotest COVID"
            comment={young.autoTestPCRFilesComment}
          />
          {statusAutoTestPCR === FILE_STATUS_PHASE1.TO_UPLOAD && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("autoTestPCR")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
        <ModalConfirmWithMessage
          isOpen={modal?.isOpen}
          title={modal?.title}
          message={modal?.message}
          placeholder="Précisez les corrections à apporter ici"
          onChange={() => {
            setModal({ isOpen: false, onConfirm: null }), setLoading(false);
          }}
          onConfirm={(message) => {
            modal?.onConfirm(message);
            setModal({ isOpen: false, onConfirm: null });
          }}
        />
      </article>
    </>
  );
}

const TestModal = ({ values, young, updateYoung, name, nameFiles, comment, setChecked, required, errorMessage = "Vous devez téléverser un document justificatif" }) => {
  const [addedFile, setAddedFile] = useState();

  console.log("checked==>", values.checked);

  const handleChangeToggle = async (newValue) => {
    console.log("name==>", name);
    console.log("newValue", newValue);
    try {
      const { ok, code } = await api.put(`/young/${young._id}/phase1Files/${name}`, newValue);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Mis à jour!");
      updateYoung();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
    }
  };

  const handleSubmit = () => {
    console.log("test submit ok!");
  };

  return (
    <>
      <div className="w-full border-b border-b-gray-300 p-2 ">
        <div className="flex items-center justify-start space-x-4">
          {name && (
            <Switch
              uncheckedIcon={false}
              checkedIcon={false}
              offColor="#E5E7EB"
              onColor="#16A34A"
              width={36}
              height={16}
              checked={values.checked}
              onChange={() => {
                setChecked(!values.checked);
                handleChangeToggle(!values.checked);
              }}
            />
          )}
          <div>
            Accord : <span>{values.checked ? "Oui" : "Non"}</span>{" "}
          </div>
        </div>

        {/* <section className="flex flex-col items-center rounded-lg  w-[90%] lg:w-[70%]">
            <DndFileInput
              placeholder="un document justificatif"
              errorMessage="Vous devez téléverser un document justificatif"
              value={undefined} // Since this is a modal, the component will handle the data fetching by itself
              path={`/young/${young._id}/documents/${nameFiles}`}
              name={nameFiles}
            />
          </section>
          {comment && (
            <section className="flex flex-col items-center bg-gray-50 rounded-lg p-10 w-[90%] lg:w-[70%] my-4">
              <p className="w-[90%]">
                <strong>Correction demandée :</strong>
                <br /> <em>&ldquo;{comment}&rdquo;</em>
              </p>
            </section>
          )} */}
      </div>
      <div className="p-2">
        <label htmlFor="file-drop" className="mb-2 cursor-pointer">
          Téléverser le Document
        </label>
        <input
          type="file"
          id="file-drop"
          className="hidden"
          onChange={(event) => {
            setAddedFile(event.target.files[0]);
            handleSubmit();
          }}
        />
        <div>Supprimer le document</div>
      </div>
    </>
  );
};

// const TestModal = ({ initialValues, young, updateYoung, title, name, nameFiles, comment, setChecked }) => {
//   console.log("checked==>", initialValues.checked);
//   return (
//     <>
//       <div className="w-full border-b border-b-gray-300 p-2">
//         <Formik
//           initialValues={initialValues}
//           validateOnChange={false}
//           validateOnBlur={false}
//           onSubmit={async (values) => {
//             try {
//               const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/${name}`, values);
//               if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
//               toastr.success("Mis à jour!");
//               updateYoung();
//             } catch (e) {
//               console.log(e);
//               toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
//             }
//           }}>
//           {({ values, handleChange, handleSubmit }) => (
//             <>
//               <div className="p-2 text-center w-full flex flex-col items-center">
//                 {values[nameFiles]?.length && !name ? null : (
//                   <div className="flex items-center space-x-4">
//                     {name && (
//                       <Switch
//                         uncheckedIcon={false}
//                         checkedIcon={false}
//                         offColor="#E5E7EB"
//                         onColor="#16A34A"
//                         width={36}
//                         height={16}
//                         checked={values.checked}
//                         onChange={() => {
//                           setChecked(!values.checked), handleChange(!values.checked);
//                         }}
//                       />

//                       //  <Select
//                       //   id="agreement"
//                       //   placeholder="Non renseigné"
//                       //   name={name}
//                       //   values={values}
//                       //   handleChange={(e) => {
//                       //     handleChange(e), handleSubmit();
//                       //   }}
//                       //   title="Accord :"
//                       //   options={[
//                       //     { value: "true", label: "Oui" },
//                       //     { value: "false", label: "Non" },
//                       //   ]}
//                       // />
//                     )}
//                     <div>
//                       Accord : <span>{values.checked ? "Oui" : "Non"}</span>{" "}
//                     </div>
//                   </div>
//                 )}

//                 <section className="flex flex-col items-center rounded-lg  w-[90%] lg:w-[70%]">
//                   <DndFileInput
//                     placeholder="un document justificatif"
//                     errorMessage="Vous devez téléverser un document justificatif"
//                     value={undefined} // Since this is a modal, the component will handle the data fetching by itself
//                     path={`/young/${young._id}/documents/${nameFiles}`}
//                     name={nameFiles}
//                   />
//                 </section>
//                 {comment && (
//                   <section className="flex flex-col items-center bg-gray-50 rounded-lg p-10 w-[90%] lg:w-[70%] my-4">
//                     <p className="w-[90%]">
//                       <strong>Correction demandée :</strong>
//                       <br /> <em>&ldquo;{comment}&rdquo;</em>
//                     </p>
//                   </section>
//                 )}
//               </div>
//             </>
//           )}
//         </Formik>
//       </div>
//       <div className="p-2">
//         <div>Téléverser le Document</div>
//         <div>Supprimer le document</div>
//       </div>
//     </>
//   );
// };

const ModalDocument = ({ isOpen, onCancel, initialValues, young, updateYoung, title, name, nameFiles, comment }) => {
  return (
    <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
      {/* modalContainer */}
      <ModalContainer className="flex justify-center items-center flex-col bg-white">
        <CloseSvg className="close-icon hover:cursor-pointer absolute right-0 top-0" height={10} width={10} onClick={onCancel} />
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/${name}`, values);
              if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
              toastr.success("Mis à jour!");
              updateYoung();
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit }) => (
            <>
              <div className="p-2 text-center w-full flex flex-col items-center">
                <div className="mb-4">
                  <h3 className="mb-3">{title}</h3>
                  {values[nameFiles]?.length && !name ? null : (
                    <div className="px-3 py-6 my-2 mx-auto">
                      {!values[nameFiles]?.length && (
                        <p className="mb-3 text-gray-500">
                          <em>Le volontaire n&apos;a pas encore renseigné sa pièce justificative.</em>
                        </p>
                      )}
                      {name && (
                        <Select
                          placeholder="Non renseigné"
                          name={name}
                          values={values}
                          handleChange={(e) => {
                            handleChange(e), handleSubmit();
                          }}
                          title="Accord :"
                          options={[
                            { value: "true", label: "Oui" },
                            { value: "false", label: "Non" },
                          ]}
                        />
                      )}
                    </div>
                  )}
                </div>
                <section className="flex flex-col items-center rounded-lg  w-[90%] lg:w-[70%]">
                  <DndFileInput
                    placeholder="un document justificatif"
                    errorMessage="Vous devez téléverser un document justificatif"
                    value={undefined} // Since this is a modal, the component will handle the data fetching by itself
                    path={`/young/${young._id}/documents/${nameFiles}`}
                    name={nameFiles}
                  />
                </section>
                {comment && (
                  <section className="flex flex-col items-center bg-gray-50 rounded-lg p-10 w-[90%] lg:w-[70%] my-4">
                    <p className="w-[90%]">
                      <strong>Correction demandée :</strong>
                      <br /> <em>&ldquo;{comment}&rdquo;</em>
                    </p>
                  </section>
                )}
              </div>
            </>
          )}
        </Formik>
        <div>
          <ModalButton onClick={onCancel}>Retour</ModalButton>
        </div>
      </ModalContainer>
    </Modal>
  );
};
