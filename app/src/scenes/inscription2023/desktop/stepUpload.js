import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { ID } from "../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
import plausibleEvent from "../../../services/plausible";
import ErrorMessage from "../components/ErrorMessage";
import MyDocs from "../components/MyDocs";
import dayjs from "dayjs";

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young?.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [hasChanged, setHasChanged] = useState(false);
  const [recto, setRecto] = useState([]);
  const [verso, setVerso] = useState([]);
  const files = [...recto, ...verso];
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : null);
  const corrections = young.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate"].includes(e.field));

  function resetState() {
    setRecto([]);
    setVerso([]);
    setHasChanged(false);
    setLoading(false);
  }

  async function onSubmit() {
    try {
      setLoading(true);

      if (young?.files?.cniFiles?.length + files?.length > 3) {
        return young?.files?.cniFiles?.length
          ? { error: `Vous ne pouvez téléverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles.length} fichiers en ligne.` }
          : { error: "Vous ne pouvez téléverser plus de 3 fichiers." };
      }

      for (const file of files) {
        if (file.size > 5000000) {
          setLoading(false);
          setError({ text: `Ce fichier ${files.name} est trop volumineux.` });
          return;
        }
      }

      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, category, dayjs(date).locale("fr").format("YYYY-MM-DD"));

      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res.code });
        resetState();
        return;
      }

      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date: dayjs(date).locale("fr").format("YYYY-MM-DD") });

      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: code });
        resetState();
        return;
      }

      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA inscription - CI desktop");
      history.push("/inscription2023/confirm");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  async function onCorrect() {
    try {
      setLoading(true);

      if (young?.files?.cniFiles?.length + files?.length > 3) {
        return young?.files?.cniFiles?.length
          ? { error: `Vous ne pouvez téléverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles.length} fichiers en ligne.` }
          : { error: "Vous ne pouvez téléverser plus de 3 fichiers." };
      }

      for (const file of files) {
        if (file.size > 5000000) {
          setLoading(false);
          setError({ text: `Ce fichier ${files.name} est trop volumineux.` });
          return;
        }
      }

      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, category, dayjs(date).locale("fr").format("YYYY-MM-DD"));

      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res.code });
        resetState();
        return;
      }

      const data = { latestCNIFileExpirationDate: date, latestCNIFileCategory: category };
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/correction", data);

      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: code });
        resetState();
        return;
      }

      plausibleEvent("Phase0/CTA demande correction - Corriger ID");
      dispatch(setYoung(responseData));
      history.push("/");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  function checkIfValid() {
    if (corrections?.length) {
      return hasChanged && !loading && !error.text;
    } else {
      return (young?.files?.cniFiles?.length || (recto?.length && (verso.length || category === "passport"))) && date && !loading && !error.text;
    }
  }

  const isEnabled = checkIfValid();

  if (!category) return <div>Loading</div>;

  return (
    <DesktopPageContainer
      title={ID[category].title}
      subTitle={ID[category].subTitle}
      onSubmit={onSubmit}
      modeCorrection={corrections?.length > 0}
      onCorrection={onCorrect}
      disabled={!isEnabled}
      loading={loading}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {corrections
        ?.filter(({ field }) => field === "cniFile")
        .map((e) => (
          <ErrorMessage key={e._id}>
            <strong>{translateCorrectionReason(e.reason)}</strong>
            {e.message && ` : ${e.message}`}
          </ErrorMessage>
        ))}
      <div className="my-16 flex w-full justify-around">
        <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
        {ID[category].imgBack && <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
      </div>
      <div className="border-l-8 border-l-[#6A6AF4] pl-8 leading-loose">
        Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
        document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
      </div>
      <hr className="my-8 h-px bg-gray-200 border-0" />

      <p className="my-4">
        Ajouter <strong>le recto</strong>
      </p>
      <div className="text-gray-500 text-sm my-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Trois fichiers maximum.</div>
      <input
        type="file"
        id="file-upload-recto"
        name="file-upload-recto"
        accept=".png, .jpg, .jpeg, .pdf"
        onChange={(e) => {
          setRecto(e.target.files);
          setError({});
          setHasChanged(true);
        }}
        className="hidden"
      />
      <div className="my-4 flex w-full">
        <div>
          <label htmlFor="file-upload-recto" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
            Parcourir...
          </label>
        </div>
        <div className="ml-4 mt-2">
          {recto ? (
            Array.from(recto).map((e) => (
              <p className="text-gray-800 text-sm" key={e.name}>
                {e.name}
              </p>
            ))
          ) : (
            <div className="text-sm text-gray-800">Aucun fichier sélectionné.</div>
          )}
        </div>
      </div>

      {category !== "passport" && (
        <>
          <hr className="my-8 h-px bg-gray-200 border-0" />

          <p className="my-4">
            Ajouter <strong>le verso</strong>
          </p>
          <div className="text-gray-500 text-sm my-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Trois fichiers maximum.</div>
          <input
            type="file"
            id="file-upload-verso"
            name="file-upload-verso"
            accept=".png, .jpg, .jpeg, .pdf"
            onChange={(e) => {
              setVerso(e.target.files);
              setError({});
              setHasChanged(true);
            }}
            className="hidden"
          />
          <div className="flex w-full my-4">
            <div>
              <label htmlFor="file-upload-verso" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
                Parcourir...
              </label>
            </div>
            <div className="ml-4 mt-2">
              {verso ? (
                Array.from(verso).map((e) => (
                  <p className="text-gray-800 text-sm" key={e.name}>
                    {e.name}
                  </p>
                ))
              ) : (
                <div className="text-gray-800 text-sm">Aucun fichier sélectionné.</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="text-gray-800 text-sm my-4">
        Vous avez besoin d’aide pour téléverser les documents ?{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/" className="underline">
          Cliquez ici
        </a>
        .
      </div>

      {error?.text && young?.files?.cniFiles?.length + files?.length > 2 && <MyDocs />}

      {(files || date) && (
        <>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <div className="my-4 flex w-full">
            <div className="w-1/2">
              <div className="text-xl font-medium">Renseignez la date d’expiration</div>
              <div className="mt-2 mb-8 leading-loose text-gray-600">
                Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
                ).
              </div>
              {corrections
                ?.filter(({ field }) => field === "latestCNIFileExpirationDate")
                .map((e) => (
                  <ErrorMessage key={e._id}>
                    <strong>Date d&apos;expiration incorrecte</strong>
                    {e.message && ` : ${e.message}`}
                  </ErrorMessage>
                ))}
              <p className="mt-4 text-gray-800">Date d&apos;expiration</p>
              <DatePickerList
                value={date}
                onChange={(date) => {
                  setDate(date);
                  setHasChanged(true);
                }}
              />
            </div>
            <div className="w-1/2">
              <img className="mx-auto h-32" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
          </div>
        </>
      )}

      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
    </DesktopPageContainer>
  );
}
