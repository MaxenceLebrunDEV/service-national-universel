import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate, getDepartmentNumber, canCreateOrUpdateCohesionCenter } from "../../../utils";
import { Box } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default function Details({ center }) {
  const user = useSelector((state) => state.Auth.user);
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "2rem 3rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>{center.name}</h1>
      <Box>
        <Wrapper>
          <Header>
            <h4>
              <strong>Centre</strong> <span style={{ color: "#9C9C9C" }}>#{center._id}</span>
            </h4>
            {canCreateOrUpdateCohesionCenter(user) ? (
              <div style={{ flexBasis: "0" }}>
                <Link to={`/centre/${center._id}/edit`}>
                  <PanelActionButton title="Modifier" icon="pencil" style={{ margin: 0 }} />
                </Link>
              </div>
            ) : null}
          </Header>
          <Container>
            <section>
              <div className="detail">
                <div className="detail-title-first">Région :</div>
                <div className="detail-text">{center.region}</div>
              </div>
              <div className="detail">
                <div className="detail-title-first">Dép :</div>
                <div className="detail-text">
                  {center.department} ({getDepartmentNumber(center.department)})
                </div>
              </div>
              <div className="detail">
                <div className="detail-title-first">Ville :</div>
                <div className="detail-text">
                  {center.city} ({center.zip})
                </div>
              </div>
              <div className="detail">
                <div className="detail-title-first">Adresse</div>
                <div className="detail-text">{center.address}</div>
              </div>
            </section>
            <section>
              <div className="detail">
                <div className="detail-title-second">Capacité maximale :</div>
                <div className="detail-text">{center.placesTotal} places</div>
              </div>
              <div className="detail">
                <div className="detail-title-second">Accessibilité aux personnes à mobilité réduite (PMR) :</div>
                <div className="detail-text">{translate(center.pmr)}</div>
              </div>
              <div className="detail">
                <div className="detail-title-second">Séjour(s) de cohésion concerné(s) par le centre :</div>
                {center.cohorts?.map((cohort) => (
                  <div key={cohort} className="detail-text">
                    <p className="detail-badge">{cohort}</p>
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </Wrapper>
      </Box>
    </div>
  );
}

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: center;
    font-size: 1rem;
    text-align: left;
    margin-top: 1rem;
    &-title-first {
      width: 130px;
      margin-right: 1rem;
      font-weight: bold;
    }
    &-title-second {
      width: 220px;
      margin-right: 1rem;
      font-weight: bold;
    }
    &-text {
      margin-left: 1rem;
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    &-badge {
      background-color: #ede9fe;
      color: #5b21b6;
      border-radius: 4px;
      padding: 0.2rem 1rem;
    }
  }
`;

const Container = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
`;
