import React, { useState } from "react";
import DocumentSelect from "../DocumentSelect";
import Badge from "../../../../components/Badge";
import downloadPDF from "../../../../utils/download-pdf";
import { toastr } from "react-redux-toastr";
import { ROLES, YOUNG_STATUS_COLORS, translate, translatePhase1 } from "snu-lib";
import api from "../../../../services/api";
import Pencil from "../../../../assets/icons/Pencil";
import { capture } from "../../../../sentry";
import ModalDispense from "../ModalDispense";

const Phase1Header = ({ setLoading, young = null, editing = false, setEditing, loading = false, setValues, setYoung, user }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalDispense, setModalDispense] = useState({ isOpen: false });

  const canUserDownloadConvocation = () => {
    return young.hasMeetingInformation === "true" && ["AFFECTED", "DONE", "NOT_DONE", "EXEMPTED"].includes(young.statusPhase1);
  };

  const handleSendAttestationByEmail = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/certificate/1/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - certificate 1.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoie du document", e.message);
    }
  };

  const handleDownloadAttestationPdfFile = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/1`,
      fileName: `${young.firstName} ${young.lastName} - attestation 1.pdf`,
    });
  };

  const handleSendConvocationByEmail = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/convocation/cohesion/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - convocation.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoie du document", e.message);
    }
  };

  const handleDownloadConvocationPdfFile = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/cohesion`,
      fileName: `${young.firstName} ${young.lastName} - attestation 1.pdf`,
    });
  };

  const EditTop = () => {
    return (
      <>
        {!editing ? (
          <button
            className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setEditing(true)}
            disabled={loading}>
            <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
            Modifier
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                setEditing(false);
                setValues(young);
              }}
              disabled={loading}>
              Fermer
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <div className="text-lg font-medium leading-4">Séjour de cohésion</div>
          <Badge minify text={translatePhase1(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />
          {canUserDownloadConvocation() && (
            <DocumentSelect
              title="Convocation"
              onClickPdf={handleDownloadConvocationPdfFile}
              onClickMail={() =>
                setModal({
                  isOpen: true,
                  title: "Envoie de document par mail",
                  message: `Êtes-vous sûr de vouloir transmettre le document Convocation par mail à ${young.email} ?`,
                  onConfirm: handleSendConvocationByEmail,
                })
              }
            />
          )}
          {young.statusPhase1 === "DONE" && (
            <DocumentSelect
              title="Attestation de réalisation phase 1"
              onClickPdf={handleDownloadAttestationPdfFile}
              onClickMail={() =>
                setModal({
                  isOpen: true,
                  title: "Envoie de document par mail",
                  message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 1 par mail à ${young.email} ?`,
                  onConfirm: handleSendAttestationByEmail,
                })
              }
            />
          )}
          {young.statusPhase1 === "NOT_DONE" && user.role !== ROLES.HEAD_CENTER && (
            <div onClick={() => setModalDispense({ isOpen: true })} className="ml-2 cursor-pointer rounded border-[1px] border-blue-700 px-2.5 py-1.5 font-medium text-blue-700">
              Dispenser le volontaire du séjour
            </div>
          )}
        </div>
        <EditTop />
      </div>
      <ModalDispense
        isOpen={modalDispense?.isOpen}
        youngId={young?._id}
        onCancel={() => setModalDispense({ isOpen: false })}
        onSuccess={(young) => {
          setModalDispense({ isOpen: false });
          setYoung(young);
        }}
      />
    </>
  );
};

export default Phase1Header;
