import React, { useEffect, useState } from "react";
import * as FileSaver from "file-saver";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInput";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { translateModelFields } from "../../../utils";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalPJ({ isOpen, onCancel, onSave, onSend, young, application, optionsType }) {
  const [type, setType] = useState();
  const [stepOne, setStepOne] = useState(true);
  const [disabledSave, setDisabledSave] = useState(true);
  const [newFilesList, setNewFilesList] = useState([]);
  const [numberNewFile, setNumberNewFile] = useState();

  const handleCancel = async () => {
    const res = await api.uploadFile(`/application/${application._id}/file/${type}`, application[type]);
    if (res.code === "FILE_CORRUPTED") {
      return toastr.error(
        "Le fichier semble corrompu",
        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        { timeOut: 0 },
      );
    }
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    onCancel();
    setStepOne(true);
  };

  const handleSend = (type) => {
    onSave();
    onSend(type, numberNewFile > 1 ? "true" : "false");
    setStepOne(true);
  };

  useEffect(() => {
    let newNumberNewFile = 0;
    newFilesList.forEach((file) => (application[type].includes(file) ? null : (newNumberNewFile += 1)));
    !stepOne ? setDisabledSave(false) : setDisabledSave(true);
    setNumberNewFile(newNumberNewFile);
  }, [newFilesList]);

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mx-4 mt-3">
          <div className="text-gray-900 text-xl font-bold text-center uppercase">Joindre un fichier à ma mission</div>
          <div className=" text-gray-500 text-base font-normal text-center ">Vous souhaitez ajouter: </div>
          {stepOne ? (
            <div className="flex flex-col space-y-2 my-3">
              {optionsType.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setType(option);
                    setStepOne(false);
                  }}
                  className="p-2 border rounded-lg hover:bg-blue-600 hover:text-white flex justify-between space-x-2">
                  <div>{translateModelFields("mission", option)}</div>
                  {application[option]?.length !== 0 && <div className="font-bold">{application[option]?.length}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-center uppercase">{translateModelFields("mission", type)}</div>
              <Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
                {({ handleChange }) => (
                  <>
                    <div className="flex mt-2 items-center justify-center">
                      <DndFileInput
                        newDesign={true}
                        placeholder="un document justificatif"
                        errorMessage="Vous devez téléverser un document justificatif"
                        value={application[type]}
                        source={async (e) => {
                          const f = await api.get(`/application/${application._id}/file/${type}/${e}`);
                          FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
                        }}
                        name={type}
                        onChange={async (e) => {
                          const res = await api.uploadFile(`/application/${application._id}/file/${type}`, e.target.files);
                          if (res.code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 },
                            );
                          }
                          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          // We update and save it instant.
                          handleChange({ target: { value: res.data, name: type } });
                          // handleSubmit();
                        }}
                        setNewFilesList={setNewFilesList}
                      />
                    </div>
                  </>
                )}
              </Formik>
            </div>
          )}
          <div className="w-full flex space-x-2">
            <button className="my-4 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={stepOne ? onCancel : handleCancel}>
              Annuler
            </button>
            <button
              className={`my-4 border-[1px] border-gray-300 text-white rounded-lg py-2  w-full  ${disabledSave ? "bg-blue-300" : "bg-blue-600 cursor-pointer"}`}
              onClick={() => (numberNewFile >= 1 ? handleSend(type) : onSave())}
              disabled={disabledSave}>
              {numberNewFile >= 1 || disabledSave ? "Enregistrer et avertir les parties-prenantes" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}