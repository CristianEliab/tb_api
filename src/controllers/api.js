const moment = require("moment-timezone");
const axios = require("axios");

const { status } = require("../helpers/status");

const MINIMUM = 2;
const COLUMNS = 4;
const MAX_HEX = 32;

/**
 * Servicio que permitira el formateo de archivos para la lectura de estos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getFilesData = async (req, res) => {
  try {
    const { fileName } = req.query;
    //Se realiza la busqueda de los archivos
    let rsqFiles = await getSecretInfo({ url: "secret/files" });
    let files = rsqFiles.files;
    if (files) {
      let promises = [];
      //Se obtendra la informacion de cada archivo encontrado
      files.forEach((file) => {
        promises.push(
          new Promise(function (resolve, reject) {
            getSecretInfo({ url: `secret/file/${file}` })
              .then((res) => {
                resolve({ data: res, file: file });
              })
              .catch((error) => {
                console.log(`Cause by: ${error}`);
              });
          })
        );
      });

      Promise.all(promises)
        .then((result) => {
          let filesFormated = [];
          //Se iniciara el formateo de cada unos de los archivos
          result.forEach((item) => {
            let info = item.data;
            let file_name = item.file;
            if (info) {
              let rows = Array.isArray(info) ? undefined : info.split("\n");
              //La fila deberia tener minimo dos registros
              //Cabecera y al menos una linea
              if (rows) {
                if (rows.length > MINIMUM) {
                  rows.shift();
                  let lines = [];
                  rows.forEach((item) => {
                    let columns = item.split(",");
                    //Se realiza la separación por columnas, si no tienes las necesarias será una fila con error
                    if (columns.length === COLUMNS) {
                      let line = {
                        text: columns[1],
                        number: parseInt(columns[2]),
                        hex: columns[3],
                      };
                      if (line.hex.length === MAX_HEX) {
                        lines.push(line);
                      }
                    }
                  });
                  filesFormated.push({
                    file: file_name,
                    lines: lines,
                    accepted: true,
                  });
                } else {
                  filesFormated.push({ file: file_name, accepted: false });
                }
              } else {
                filesFormated.push({ file: file_name, accepted: false });
              }
            } else {
              filesFormated.push({ file: file_name, accepted: false });
            }
          });

          //Se filtran las filas validas
          if (fileName) {
            filesFormated = filesFormated.filter(
              (item) => item.file === fileName
            );
          } else {
            filesFormated = filesFormated
              .filter((item) => item.accepted)
              .map((item) => {
                return { file: item.file, lines: item.lines };
              });
          }

          //Return formated files
          res.status(status.success).send(filesFormated);
        })
        .catch((error) => {
          console.log(`Cause by: ${error}`);
        });
    }
  } catch (error) {
    res.status(status.error).send({
      error: error,
      status: false,
    });
    const date = moment().tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
    console.log(`Date: ${date}`);
    console.log(`Cause by: ${error}`);
  }
};

/**
 * Servicio que permite listar los archivos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getFilesList = async (req, res) => {
  try {
    //Se realiza la busqueda de los archivos, tal cual como se envian en el
    //API EXTERNO
    let rsqFiles = await getSecretInfo({ url: "secret/files" });
    let files = rsqFiles.files;
    if (files) {
      res.status(status.success).send(files);
    }
  } catch (error) {
    res.status(status.error).send({
      error: error,
      status: false,
    });
    const date = moment().tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
    console.log(`Date: ${date}`);
    console.log(`Cause by: ${error}`);
  }
};

/**
 * Metodo que realiza el consumo del API EXTERNO
 * @param {*} param0
 * @returns
 */
const getSecretInfo = async ({ url }) => {
  const getInfo = {
    url: `https://echo-serv.tbxnet.com/v1/${url}`,
    method: "GET",
    headers: {
      //Access KEY
      Authorization: `Bearer aSuperSecretKey`,
    },
  };
  try {
    const rsp = await axios(getInfo);
    return rsp.status ? rsp.data : undefined;
  } catch (error) {
    return [];
  }
};

/**
 * Metodo para realizar la validacion de las pruebas
 * @param {*} param0
 * @returns
 */
const checkTest = ({ info }) => {
  if (info) {
    let rows = Array.isArray(info) ? undefined : info.split("\n");
    //La fila deberia tener minimo dos registros
    //Cabecera y al menos una linea
    if (rows) {
      if (rows.length > MINIMUM) {
        rows.shift();
        let lines = [];
        rows.forEach((item) => {
          let columns = item.split(",");
          if (columns.length === COLUMNS) {
            let line = {
              text: columns[1],
              number: parseInt(columns[2]),
              hex: columns[3],
            };
            lines.push(line);
          }
        });
        return lines.length > 0 ? true : false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

module.exports = {
  getFilesData,
  getFilesList,
  getSecretInfo,
  checkTest,
};
