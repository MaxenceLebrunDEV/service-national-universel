import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Presentation({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  function onSubmit() {
    history.push(`/representants-legaux/verification?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Déclaration sur l’honneur</h1>
        <h2>{young.firstName} souhaite s’inscrire au SNU !</h2>
        <div>Nous avons besoin de votre accord pour que {young.firstName} vive l’aventure du SNU.</div>
        <button className="mt-2 mb-6 max-w-md bg-white w-full py-2 border !border-[#000091] shadow-sm text-[#000091] font-medium">Découvrir le SNU</button>
        <ul>
          <li>Frais de séjour pris en charge par l’État</li>
          <li>80 000 jeunes se sont déjà engagés</li>
          <li>Pour mettre son énergie et ses valeurs au service d’une société solidaire</li>
          <li>Réalisation d’une mission d’intérêt général (phase 2)</li>
          <li>Possibilité de poursuivre son engagement en phase 3</li>
        </ul>
        <h2>Première étape</h2>
        <div>Le séjour de cohésion : 2 semaines dans un autre département</div>
      </div>
      a
      <div className="fixed bottom-0 w-full z-50">
        <div className="flex flex-row shadow-ninaInverted p-4 bg-white gap-4">
          <button className={"flex items-center justify-center p-2 w-full cursor-pointer bg-[#000091] text-white"} onClick={() => onSubmit()}>
            Continuer vers la vérification
          </button>
        </div>
        <div className="flex flex-row px-4 pb-4 bg-white gap-4">Votre consentement ne sera recueilli qu’à la troisième étape de ce formulaire</div>
      </div>
    </>
  );
}