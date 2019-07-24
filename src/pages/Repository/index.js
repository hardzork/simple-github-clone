import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { GoIssueOpened, GoIssueClosed, GoGlobe } from 'react-icons/go';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  IssuePagination,
  IssueFilter,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async type => {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: type,
        per_page: 5,
      },
    });

    this.setState({
      issues: issues.data,
    });
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter>
          <button type="button" onClick={() => this.handleFilter('all')}>
            <GoGlobe size={30} />
            <span>Todas as issues</span>
          </button>
          <button type="button" onClick={() => this.handleFilter('open')}>
            <GoIssueOpened size={30} />
            <span>Issues abertas</span>
          </button>
          <button type="button" onClick={() => this.handleFilter('closed')}>
            <GoIssueClosed size={30} />
            <span>Issues fechadas</span>
          </button>
        </IssueFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <IssuePagination>
          <button type="button">
            <FaCaretLeft /> Anterior
          </button>
          <button type="button">
            Próxima <FaCaretRight />
          </button>
        </IssuePagination>
      </Container>
    );
  }
}
