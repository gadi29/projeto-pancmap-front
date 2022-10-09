import { useContext, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Popup, Marker } from "react-leaflet";
import { Icon } from "leaflet";
import styled from "styled-components";
import axios from "axios";

import PositionContext from "../contexts/PositionContext";

import "../../node_modules/leaflet/dist/leaflet.css";
import leaf from "../assets/images/leaf-svgrepo-com.svg";
import { backUrl } from "../utils/constants";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const { position } = useContext(PositionContext);
  const [registers, setRegisters] = useState();
  const [loading, setLoading] = useState(true);
  const CCACoord = [-27.582346, -48.504342];
  const [initialPosition, setInitialPosition] = useState(null);
  const point = new Icon({
    iconUrl: leaf,
    iconSize: [40, 40],
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log(position);
    if (position !== null) setInitialPosition(position);
    else
      navigator.geolocation.getCurrentPosition((position) => {
        setInitialPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      });
  }, [position]);

  useEffect(() => {
    setLoading(true);
    const response = axios.get(`${backUrl}/registers`);

    response
      .then((r) => {
        setRegisters([...r.data]);
        setLoading(false);
      })
      .catch((e) => alert(`Erro ${e.response.status}`));
  }, [initialPosition]);

  function displayMap() {
    return (
      <MapContainer center={initialPosition} zoom={16} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={"abcd"}
          maxZoom={20}
        />
        {loading ? (
          <></>
        ) : (
          registers.map((register) => (
            <Marker
              position={[Number(register.latitude), Number(register.longitude)]}
              icon={point}
            >
              <Popup>
                <div className="top">
                  <h2>{register.title}</h2>
                  <h4 onClick={() => navigate(`/specie/${register.specie.id}`)}>
                    {register.specie.cientificName}
                  </h4>
                </div>
                <h3>Obs.: {register.observations}</h3>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    );
  }

  return (
    <Body>
      <Map>{loading ? <h2>Carregando...</h2> : displayMap()}</Map>
    </Body>
  );
}

const Body = styled.div`
  background: linear-gradient(
    0deg,
    rgba(17, 120, 35, 1) 0%,
    rgba(255, 255, 255, 1) 100%
  );

  width: 100%;
  min-height: 100vh;
  position: absolute;
`;

const Map = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  margin-top: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  .top {
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
      font-size: 16px;
      font-weight: 600;
    }

    h4 {
      font-style: italic;
      margin-top: 3px;
      margin-bottom: 7px;
      cursor: pointer;
    }
  }

  .leaflet-container {
    width: 98%;
    height: 85vh;
  }
`;
