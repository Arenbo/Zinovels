function zilpayChangedAdr(account) {
  console.log('zilpayChangedAdr ', account);

  document.getElementById("novelsApp").__x.$data.zilpayChangedAdr(account);
}

// document.getElementById("novelsApp")

// function zilpayChangedNet(net) {
//   console.log('zilpayChangedNet' + net);
// }

let novelsApp = () => {
  return {
    isZilpayConnected: false,
    isZeevesConnected: false,
    isConnected: false,
    showDefaultAccount: false,
    showModalNFT: false,
    showModalNFTRawData: false,
    showModalTransfer: false,
    showModalInfo: false,
    showBtnZilpay: true,
    showBtnZeeves: true,
    showBtnLoadmoreNFTs: false,
    showBtnLoadmoreContracts: false,
    isNoTokens: true,
    contracts: [],
    selectedContract: -1,
    selectedContractTitle: '',
    selectedContractHash: '',
    selectedContractLink: '',
    selectedContractPage: 1,
    nfts: [],
    cards: [],
    dataModalNFT: { id: -1, name: '', desc: '', rawData: [] },
    dataModalTransfer: { id: -1, account: '', contractAdr: '', showErr: false, showMsg: false, errMsg: '', msg: '', showLoading: false },
    dataModalInfo: { showErr: false, showMsg: false, errMsg: '', msg: '' },
    imgModalNFTCont: '',
    imgModalNFT: '/img/loading.png',
    imgLoadingURL: '/img/loading.png',
    defaultAccount: '',
    provider: 'Mainnet',
    connectZilpay: function() {
      (async () => {
        console.log('connectZilpay pre await');
        let walletZilpay = await window.zilPay.wallet.connect();
        console.log('connectZilpay post await');

        this.isZilpayConnected = true;
        this.showDefaultAccount = true;
        this.isConnected = true;
        console.log('zilPay extension isConnect');

        console.log('window.zilPay.wallet.net', window.zilPay.wallet.net);
        console.log('window.zilPay.wallet.defaultAccount', window.zilPay.wallet.defaultAccount);
        console.log('window.zilPay.wallet.defaultAccount.bech32', window.zilPay.wallet.defaultAccount.bech32);
        console.log('window.zilPay.wallet.isEnable', window.zilPay.wallet.isEnable);
        console.log('window.zilPay.wallet.isConnect', window.zilPay.wallet.isConnect);

        this.defaultAccount = window.zilPay.wallet.defaultAccount.bech32;

        this.startApp();
      })();
    },
    connectZilpayFailed: function() {
      console.log('connectZilpayFailed');
    },
    connectZilpayComplete: function() {
      console.log('connectZilpayComplete');
    },
    zilpayChangedAdr: function(account) {
      console.log('zilpayChangedAdr ', account);
      if (this.defaultAccount!=account.bech32) {
        this.defaultAccount = account.bech32;
        this.startApp();        
      }
    },
    zilpayTransfer: function(contractAdr, toAdr, tokenId) {
      console.log('zilpayTransfer', contractAdr, toAdr, tokenId);
      let contracts = window.zilPay.contracts;
      let utils = window.zilPay.utils;
      let wallet = window.zilPay.wallet;
      console.log('zilpayTransfer contracts', contracts);
      console.log('zilpayTransfer window.zilPay', window.zilPay);

      let fqa = utils.units.toQa;
      let amount = fqa(0, utils.units.Units.Zil);
      let gasPrice = fqa('1000', utils.units.Units.Li)
      console.log('zilpayTransfer amount', amount);
      console.log('zilpayTransfer gasPrice', gasPrice);

      let contract = contracts.at(contractAdr);
      let toBase16Adr = toAdr;
      let tokenIdStr = tokenId.toString();
      (async () => {
        try {
          let tx = await contract.call(
            'Transfer',
            [
              {
                vname: 'to',
                type: 'ByStr20',
                value: toBase16Adr
              },
              {
                vname: 'token_id',
                type: 'Uint256',
                value: tokenIdStr
              }
            ],
            {
              amount,
              gasPrice,
              gasLimit: utils.Long.fromNumber(25000)
            }
          ).then(([tx, contract]) => {
            console.log('zilpayTransfer then');
          });
        }
        catch (error) {
          console.log('zilpayTransfer catch', error);
        }
      })();
    },
    connectZeeves: function() {
      (async () => {
        console.log('connectZeeves pre await');
        let walletInfo = await Zeeves.getSession();
        console.log('connectZeeves post await');
        console.log('walletInfo', walletInfo.bech32, walletInfo);

        this.isZeevesConnected = true;
        this.showDefaultAccount = true;
        this.isConnected = true;
        console.log('zilPay extension isConnect');

        this.defaultAccount = walletInfo.bech32;
        const balance = await Zeeves.blockchain.getBalance(walletInfo.bech32);
        console.log('balance', balance);

        this.startApp();
      })();
    },
    showContract: function(idx) {
      // this.btnLoadMoreOpen = false;
      this.selectedContract = idx;
      this.nfts = [];
      this.cards = [];
      var contractData = {};
      for (var i = 0; i < this.contracts.length; i++) {
        if (this.contracts[i].idx==idx) {
          contractData = this.contracts[i];
        }
      }
      console.log('showContract', idx, contractData);

      this.selectedContractTitle = contractData.title + ' (' + contractData.balance + ' NFTs)';
      this.selectedContractHash = contractData.hash;
      this.selectedContractLink = '<a href="https://viewblock.io/zilliqa/address/' + contractData.hash + '?network=mainnet" target="_blank">' + contractData.hash + '</a>';
      for (var i = 0; i < contractData.nftsData.length; i++) {
        this.nfts.push({ id: contractData.nftsData[i].id, adr: contractData.hash });
      }

      if (contractData.nftsData.length>6) {
        this.showBtnLoadmoreNFTs = true;
      }

      var y = 0;
      for (var i = 0; i < contractData.nftsData.length; i++) {
        if (contractData.nftsData[i].isLoaded) {
          this.showNFT(i);
          y++;
        }
      }
      if (y==0) {
        this.showNextNFTs();
      }
    },
    showNextNFTs: function() {
      console.log('showNextNFTs');

      // this.selectedContract = idx;
      var contractData = {};
      for (var i = 0; i < this.contracts.length; i++) {
        if (this.contracts[i].idx==this.selectedContract) {
          contractData = this.contracts[i];
        }
      }

      // only if loaded false and only six in a row
      // console.log('showNextNfts >>> ', contractData.nftsData);
      var y = 0;
      for (var i = 0; i < contractData.nftsData.length; i++) {
        if (y<6) {
          if (!contractData.nftsData[i].isLoaded) {
            this.showNFT(i);
            y++;
          }
        }
      }
    },
    showNFT: function(idx) {
      // show NFT for selected contract
      var contractData = {};
      for (var i = 0; i < this.contracts.length; i++) {
        if (this.contracts[i].idx==this.selectedContract) {
          contractData = this.contracts[i];
        }
      }
      var adr = contractData.hash;
      var id = contractData.nftsData[idx].id;
      console.log('showNFT', contractData, adr, idx, id);

      this.imgCont = '<img src="' + this.imgLoadingURL + '">';

      url = "/tokens/" + this.provider + "/" + adr + "/" + id;
      fetch(url)
      .then(response => response.json())
      .then(data => {

        contractData.nftsData[idx].isLoaded = true;
        contractData.nftsData[idx].name = data.name;
        contractData.nftsData[idx].imgUrl = data.imageUrl;
        contractData.nftsData[idx].data = data.data;

        this.cards.push({ idx: idx, id: id, name: data.name, url: data.imageUrl });
        console.log(data);

      // if no need to load more - hiding button
        if (contractData.nftsData.length>this.cards.length) {
          this.showBtnLoadmoreNFTs = true;
        } else {
          this.showBtnLoadmoreNFTs = false;          
        }
      });
    },
    showExample: function() {
      console.log('showExample');
      this.defaultAccount = 'zil1cyck4za8yrxryxs6h0mupu5w3j72a3as6e5lqz';
      this.showContracts();
    },
    showNextContracts: function() {
      console.log('showNextContracts');
      this.selectedContractPage++;
      this.showContracts();
    },
    showContracts: function() {
      console.log('showContracts');
      console.log('this.contracts', this.contracts);

      // this.contracts = [];
      // this.nfts = [];
      // this.cards = [];

      url = "/contracts/" + this.selectedContractPage + "/" + this.defaultAccount;
      console.log('url', url);

      fetch(url)
      .then(response => response.json())
      .then(data => {
        // create error handling
        if (data.status=='ok') {
          for (var i = 0; i < data.data[0].tokens.docs.length; i++) {
            var hash = data.data[0].tokens.docs[i].hash;
            var name = data.data[0].tokens.docs[i].name;
            var balance = data.data[0].tokens.docs[i].balance;
            var balanceInt = parseInt(balance);
            var title = name;
            var nfts = data.data[0].tokens.docs[i].nfts;
            var nftsData = [];
            var isZRC1 = data.data[0].tokens.docs[i].isZRC1;
            var isZRC2 = data.data[0].tokens.docs[i].isZRC2;
            if (isZRC1===undefined) {
              isZRC1 = false;
            }
            if (isZRC2===undefined) {
              isZRC2 = false;
            }
            if (isZRC1) {
              for (var y = 0; y < nfts.length; y++) {
                nftsData.push({ id: nfts[y], isLoaded: false });
              }
              this.contracts.push({
                idx: i,
                hash: hash,
                title: title,
                name: name,
                nftsData: nftsData,
                balance: balance,
                isZRC1: isZRC1,
                isZRC2: isZRC2
              });              
            }

            // if no need to load more - hiding button
            if (data.data[0].tokens.hasNextPage) {
              this.showBtnLoadmoreContracts = true;
            } else {
              this.showBtnLoadmoreContracts = false;          
            }

          }
          console.log('this.contracts', this.contracts);
          console.log(data.data[0].tokens.docs);

          if (this.contracts.length>0) {
            this.isNoTokens = false;
            this.showContract(this.contracts[0].idx);
          }
          else {
            this.isNoTokens = true;
          }
        }
        else {
          console.log(data);
        }
      });
    },
    showNftPopup: function(idx) {
      var contractData = {};
      for (var i = 0; i < this.contracts.length; i++) {
        if (this.contracts[i].idx==this.selectedContract) {
          contractData = this.contracts[i];
        }
      }

      var imgUrl = contractData.nftsData[idx].imgUrl;
      var data = contractData.nftsData[idx].data;
      console.log('showNftFull', contractData.nftsData[idx]);
      console.log('showNftFull', idx, imgUrl);
      console.log('showNftFull data', data);
      this.dataModalNFT.id = contractData.nftsData[idx].id;
      this.dataModalNFT.name = data.name;
      this.dataModalNFT.desc = data.description;

      this.dataModalNFT.rawData = [];
      for(var index in data) { 
        var attr = data[index];
        this.dataModalNFT.rawData.push({ k: 0, val: index + ': ' + attr });
      }
      this.dataModalNFT.data = JSON.stringify(data);

      this.imgModalNFTCont = '<img src="' + imgUrl + '">';
      this.imgModalNFT = imgUrl;
      this.showModalNFT = true;
      this.showModalNFTRawData = false;
    },
    showNftPopupRawData: function() {
      console.log('showNftPopupRawData');
      this.showModalNFTRawData = true;
    },
    showTransferPopup: function(idx) {
      console.log('showTransferPopup isZilpayConnected', this.isZilpayConnected);
      console.log('showTransferPopup isZeevesConnected', this.isZeevesConnected);
      if (this.isZeevesConnected) {
        this.showInfoPopup(true, 'Please connect via ZilPay to transfer tokens', false, '');       
      }

      if (this.isZilpayConnected) {
        this.dataModalTransfer.id = -1;
        this.dataModalTransfer.account = '';
        this.dataModalTransfer.contractAdr = this.selectedContractHash;
        this.dataModalTransfer.showErr = false;
        this.dataModalTransfer.showMsg = false;
        this.dataModalTransfer.errMsg = '';
        this.dataModalTransfer.msg = '';
        this.dataModalTransfer.showLoading = false;

        var contractData = {};
        for (var i = 0; i < this.contracts.length; i++) {
          if (this.contracts[i].idx==this.selectedContract) {
            contractData = this.contracts[i];
          }
        }
        var data = contractData.nftsData[idx].data;
        console.log('showTransferPopup', contractData.nftsData[idx]);
        console.log('showTransferPopup data', data);
        console.log('showTransferPopup this.dataModalTransfer', this.dataModalTransfer);
        this.dataModalTransfer.id = contractData.nftsData[idx].id;

        this.showModalTransfer = true;
      }
    },
    showModalTransferDo: function() {
      console.log('showModalTransferDo', this.dataModalTransfer.account);

      this.dataModalTransfer.showErr = false;
      this.dataModalTransfer.showMsg = false;
      this.dataModalTransfer.errMsg = '';
      this.dataModalTransfer.msg = '';

      if (this.dataModalTransfer.account=='') {
        this.dataModalTransfer.errMsg = 'Error: account is blank';
        this.dataModalTransfer.showErr = true;
      }

      if (this.dataModalTransfer.account.substring(0, 2)!='0x') {
        this.dataModalTransfer.errMsg = 'Error: account need to be in Base16 format';
        this.dataModalTransfer.showErr = true;
      }

      if (!this.dataModalTransfer.showErr) {
        // this.dataModalTransfer.msg = 'Transfer started';
        this.dataModalTransfer.msg = 'Please confirm transaction';
        this.dataModalTransfer.showMsg = true;
        this.dataModalTransfer.showLoading = true;

        this.zilpayTransfer(this.dataModalTransfer.contractAdr, this.dataModalTransfer.account, this.dataModalTransfer.id);
      }
    },
    showInfoPopup: function(showErr, errMsg, showMsg, msg) {
      console.log('showInfoPopup', showErr, errMsg, showMsg, msg);
      this.dataModalInfo.showErr = showErr;
      this.dataModalInfo.showMsg = showMsg;
      this.dataModalInfo.errMsg = errMsg;
      this.dataModalInfo.msg = msg;
      this.showModalInfo = true;  
    },
    startApp: function() {
      console.log('startApp');

      this.contracts = [];
      this.nfts = [];
      this.cards = [];
      this.selectedContract = -1;
      this.selectedContractTitle = '';
      this.selectedContractHash = '';
      this.selectedContractLink = '';
      this.selectedContractPage = 1;

      this.showContracts();
    },
    initApp: function () {
      console.log('initApp');
      console.log('zilpay', window.zilPay);

      if (typeof window.zilPay !== 'undefined') {
        console.log('zilPay exists');
        if (window.zilPay.wallet.isEnable) {
          console.log('zilPay extension enabled');
        }
        else {
          console.log('zilPay extension need to be enabled');
        }
        if (window.zilPay.wallet.isConnect) {
          this.isZilpayConnected = true;
          this.showDefaultAccount = true;
          this.isConnected = true;
          console.log('zilPay extension isConnect');

          console.log('window.zilPay.wallet.net', window.zilPay.wallet.net);
          console.log('window.zilPay.wallet.defaultAccount', window.zilPay.wallet.defaultAccount);
          console.log('window.zilPay.wallet.defaultAccount.bech32', window.zilPay.wallet.defaultAccount.bech32);
          console.log('window.zilPay.wallet.isEnable', window.zilPay.wallet.isEnable);
          console.log('window.zilPay.wallet.isConnect', window.zilPay.wallet.isConnect);

          this.defaultAccount = window.zilPay.wallet.defaultAccount.bech32;

          window.zilPay.wallet.observableAccount().subscribe(function (account) {
            console.log('observableAccount ', account);
            zilpayChangedAdr(account);
          });

          // let networkStreamChanged = window.zilPay.wallet.observableNetwork();
          // networkStreamChanged.subscribe(net => zilpayChangedNet);

          this.startApp();
        }
        else {
          // show buttons if not connected (zilpay, zeeves)

          console.log('zilPay extension need to be Connected');
        }
      }
      else {
          console.log('zilPay extension needed');
      }
    }
  };
}